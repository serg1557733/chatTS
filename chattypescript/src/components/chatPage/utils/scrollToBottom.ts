import { RefObject } from "react"

export const scrollToBottom = (endMessages: RefObject<HTMLDivElement>) => {
    endMessages.current?.scrollIntoView({ behavior: "smooth" })
}