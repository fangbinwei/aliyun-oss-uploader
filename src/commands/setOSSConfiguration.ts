import { ext } from '@/extensionVariables'
import { getThemedIconPath, IconPath } from '@/views/iconPath'
import { getElanConfiguration, updateOSSConfiguration } from '@/utils/index'
import { OSS_REGION } from '@/constant'

import {
  QuickPickItem,
  window,
  Disposable,
  QuickInputButton,
  QuickInput,
  QuickInputButtons
} from 'vscode'
import Logger from '@/utils/log'

/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 *
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
export async function setOSSConfiguration(): Promise<void> {
  class MyButton implements QuickInputButton {
    constructor(public iconPath: IconPath, public tooltip: string) {}
  }

  interface State {
    title: string
    step: number
    totalSteps: number
    region: QuickPickItem | string
    bucket: string
    accessKeyId: string
    accessKeySecret: string
  }
  const regions: QuickPickItem[] = [...OSS_REGION].map((label) => ({ label }))

  async function collectInputs(): Promise<State> {
    const oldConfiguration = getElanConfiguration()
    const state: Partial<State> = {}
    state.accessKeyId = oldConfiguration.accessKeyId
    state.accessKeySecret = oldConfiguration.accessKeySecret
    state.bucket = oldConfiguration.bucket
    const regionInList = regions.find(
      (item) => item.label === oldConfiguration.region
    )
    state.region = regionInList || oldConfiguration.region

    await MultiStepInput.run((multiStepInput) =>
      pickRegion(multiStepInput, state)
    )
    return state as State
  }

  const title = 'Set OSS Configuration'

  const addRegionButton = new MyButton(
    getThemedIconPath('add'),
    'Create Region'
  )
  async function pickRegion(
    multiStepInput: MultiStepInput,
    state: Partial<State>
  ): Promise<InputStep> {
    const pick = await multiStepInput.showQuickPick({
      title,
      step: 1,
      totalSteps: 4,
      placeholder: `Pick a region or click 'Add' icon to enter the region`,
      items: regions,
      buttons: [addRegionButton],
      activeItem: typeof state.region !== 'string' ? state.region : undefined,
      shouldResume: shouldResume
    })
    if (pick instanceof MyButton) {
      return (multiStepInput: MultiStepInput): Promise<InputStep> =>
        inputRegion(multiStepInput, state)
    }
    state.region = pick
    return (multiStepInput: MultiStepInput): Promise<InputStep> =>
      inputBucket(multiStepInput, state)
  }

  async function inputRegion(
    multiStepInput: MultiStepInput,
    state: Partial<State>
  ): Promise<InputStep> {
    state.region = await multiStepInput.showInputBox({
      title,
      step: 2,
      totalSteps: 5,
      value: typeof state.region === 'string' ? state.region : '',
      prompt: 'Enter the region',
      validate: validateInputValue,
      shouldResume: shouldResume
    })
    return (multiStepInput: MultiStepInput): Promise<InputStep> =>
      inputBucket(multiStepInput, state)
  }

  async function inputBucket(
    multiStepInput: MultiStepInput,
    state: Partial<State>
  ): Promise<InputStep> {
    const additionalSteps = typeof state.region === 'string' ? 1 : 0
    // TODO: Remember current value when navigating back.
    state.bucket = await multiStepInput.showInputBox({
      title,
      step: 2 + additionalSteps,
      totalSteps: 4 + additionalSteps,
      value: state.bucket || '',
      prompt: 'Enter the bucket name',
      validate: validateInputValue,
      shouldResume: shouldResume
    })
    return (multiStepInput: MultiStepInput): Promise<InputStep> =>
      inputAccessKeyId(multiStepInput, state)
  }

  async function inputAccessKeyId(
    multiStepInput: MultiStepInput,
    state: Partial<State>
  ): Promise<InputStep> {
    const additionalSteps = typeof state.region === 'string' ? 1 : 0
    state.accessKeyId = await multiStepInput.showInputBox({
      title,
      step: 3 + additionalSteps,
      totalSteps: 4 + additionalSteps,
      value: state.accessKeyId || '',
      prompt: 'Enter the accessKeyId',
      validate: validateInputValue,
      shouldResume: shouldResume
    })

    return (multiStepInput: MultiStepInput): Promise<void> =>
      inputAccessKeySecret(multiStepInput, state)
  }
  async function inputAccessKeySecret(
    multiStepInput: MultiStepInput,
    state: Partial<State>
  ): Promise<void> {
    const additionalSteps = typeof state.region === 'string' ? 1 : 0
    state.accessKeySecret = await multiStepInput.showInputBox({
      title,
      step: 4 + additionalSteps,
      totalSteps: 4 + additionalSteps,
      value: state.accessKeySecret || '',
      prompt: 'Enter the accessKeySecret',
      validate: validateInputValue,
      shouldResume: shouldResume
    })
  }

  function shouldResume(): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      window
        .showInformationMessage(
          'Continue Configuration?',
          {
            modal: true
          },
          'Continue'
        )
        .then(
          (v) => {
            if (v === 'Continue') return resolve(true)
            resolve(false)
          },
          () => {
            resolve(false)
          }
        )
    })
  }

  // it support validating async
  async function validateInputValue(
    input: string
  ): Promise<string | undefined> {
    if (!input) return 'Required'
  }

  try {
    const state = await collectInputs()
    await updateOSSConfiguration({
      region:
        typeof state.region === 'string' ? state.region : state.region.label,
      accessKeyId: state.accessKeyId,
      accessKeySecret: state.accessKeySecret,
      bucket: state.bucket
    })

    if (ext.bucketExplorerTreeViewVisible) ext.bucketExplorer.refresh()
    window.showInformationMessage(`Configuration Updated`)
  } catch (err) {
    if (err.message === 'cancel') return
    Logger.log(`Failed to set configuration. Reason ${err.message}`)
  }
}

// -------------------------------------------------------
// Helper code that wraps the API for the multi-step case.
// -------------------------------------------------------

class InputFlowAction {
  static back = new InputFlowAction()
  static cancel = new InputFlowAction()
  static resume = new InputFlowAction()
}

type InputStep = (multiStepInput: MultiStepInput) => Promise<InputStep | void>

interface QuickPickParameters<T extends QuickPickItem> {
  title: string
  step: number
  totalSteps: number
  ignoreFocusOut?: boolean
  items: T[]
  activeItem?: T
  placeholder: string
  buttons?: QuickInputButton[]
  shouldResume: () => Promise<boolean>
}

interface InputBoxParameters {
  title: string
  step: number
  totalSteps: number
  ignoreFocusOut?: boolean
  value: string
  prompt: string
  validate: (value: string) => Promise<string | undefined>
  buttons?: QuickInputButton[]
  shouldResume: () => Promise<boolean>
}

class MultiStepInput {
  static async run<T>(start: InputStep): Promise<void> {
    const multiStepInput = new MultiStepInput()
    return multiStepInput.stepThrough(start)
  }

  private current?: QuickInput
  private steps: InputStep[] = []

  private async stepThrough<T>(start: InputStep): Promise<void> {
    let step: InputStep | void = start
    let cancel = false
    while (step) {
      this.steps.push(step)
      if (this.current) {
        this.current.enabled = false
        this.current.busy = true
      }
      try {
        step = await step(this)
      } catch (err) {
        if (err === InputFlowAction.back) {
          this.steps.pop()
          step = this.steps.pop()
        } else if (err === InputFlowAction.resume) {
          step = this.steps.pop()
        } else if (err === InputFlowAction.cancel) {
          step = undefined
          cancel = true
        } else {
          throw err
        }
      }
    }
    if (this.current) {
      this.current.dispose()
    }
    if (cancel) {
      throw new Error('cancel')
    }
  }

  async showQuickPick<
    T extends QuickPickItem,
    P extends QuickPickParameters<T>
  >({
    title,
    step,
    totalSteps,
    ignoreFocusOut,
    items,
    activeItem,
    placeholder,
    buttons,
    shouldResume
  }: P): Promise<
    | T
    | (P extends {
        buttons: (infer I)[]
      }
        ? I
        : never)
  > {
    const disposables: Disposable[] = []
    try {
      return await new Promise<
        T | (P extends { buttons: (infer I)[] } ? I : never)
      >((resolve, reject) => {
        const input = window.createQuickPick<T>()
        input.title = title
        input.step = step
        input.totalSteps = totalSteps
        input.ignoreFocusOut = ignoreFocusOut || true
        input.placeholder = placeholder
        input.items = items
        if (activeItem) {
          input.activeItems = [activeItem]
        }
        input.buttons = [
          ...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
          ...(buttons || [])
        ]
        disposables.push(
          input.onDidTriggerButton((item) => {
            if (item === QuickInputButtons.Back) {
              reject(InputFlowAction.back)
            } else {
              resolve(item as any)
            }
          }),
          input.onDidChangeSelection((items) => resolve(items[0])),
          input.onDidHide(() => {
            ;(async (): Promise<void> => {
              reject(
                shouldResume && (await shouldResume())
                  ? InputFlowAction.resume
                  : InputFlowAction.cancel
              )
            })()
          })
        )
        if (this.current) {
          this.current.dispose()
        }
        this.current = input
        this.current.show()
      })
    } finally {
      disposables.forEach((d) => d.dispose())
    }
  }

  async showInputBox<P extends InputBoxParameters>({
    title,
    step,
    totalSteps,
    value,
    ignoreFocusOut,
    prompt,
    validate,
    buttons,
    shouldResume
  }: P): Promise<string | (P extends { buttons: (infer I)[] } ? I : never)> {
    const disposables: Disposable[] = []
    try {
      return await new Promise<
        string | (P extends { buttons: (infer I)[] } ? I : never)
      >((resolve, reject) => {
        const input = window.createInputBox()
        input.title = title
        input.step = step
        input.totalSteps = totalSteps
        input.value = value || ''
        input.prompt = prompt
        input.ignoreFocusOut = ignoreFocusOut || true
        input.buttons = [
          ...(this.steps.length > 1 ? [QuickInputButtons.Back] : []),
          ...(buttons || [])
        ]
        let validating
        disposables.push(
          input.onDidTriggerButton((item) => {
            if (item === QuickInputButtons.Back) {
              reject(InputFlowAction.back)
            } else {
              resolve(item as any)
            }
          }),
          input.onDidAccept(async () => {
            const value = input.value
            input.enabled = false
            input.busy = true
            if (!(await validate(value))) {
              resolve(value)
            }
            input.enabled = true
            input.busy = false
          }),
          input.onDidChangeValue(async (text) => {
            const current = validate(text)
            validating = current
            const validationMessage = await current
            // for async validate
            if (current === validating) {
              input.validationMessage = validationMessage
            }
          }),
          input.onDidHide(() => {
            // this.current && this.current.show()
            ;(async (): Promise<void> => {
              reject(
                shouldResume && (await shouldResume())
                  ? InputFlowAction.resume
                  : InputFlowAction.cancel
              )
            })()
          })
        )
        if (this.current) {
          this.current.dispose()
        }
        this.current = input
        this.current.show()
      })
    } finally {
      disposables.forEach((d) => d.dispose())
    }
  }
}
