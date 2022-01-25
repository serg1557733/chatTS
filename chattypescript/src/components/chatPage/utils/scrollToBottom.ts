import { RefObject } from "react"

export const scrollToBottom = (endMessages: RefObject<HTMLDivElement>): void => {
    endMessages.current?.scrollIntoView({ behavior: "smooth" })
}