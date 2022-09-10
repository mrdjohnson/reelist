import { useState } from 'react'

const useIsPressed = () => {
  const [isPressed, setIsPressed] = useState(false)

  return {
    isPressed,
    onPressIn: () => setIsPressed(true),
    onPressOut: () => setIsPressed(false),
  }
}

export default useIsPressed
