import { redirect } from 'next/navigation'
import { getSetupState, getRedirectStep } from '@/lib/setup/state'

export default async function SetupPage() {
  const state = await getSetupState()

  if (state.isComplete) {
    redirect('/')
  }

  const step = getRedirectStep(state)
  redirect(step)
}
