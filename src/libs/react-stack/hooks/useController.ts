import UseStackContext from './useStackContext'

export interface UseControllerProps {
  name: string
}

const UseController = ({ name }: UseControllerProps) => {
  const {
    stackMethods: { update }
  } = UseStackContext()

  const toggle = (open: boolean) => {
    update(name, {
      open: open
    })
  }
  const open = () => {
    toggle(true)
  }

  const close = () => {
    toggle(false)
  }

  return { open, close }
}

export default UseController
