import CursorSVG from '@/public/assets/CursorSVG'
import { CursorChatProps, CursorMode } from '@/types/type'
import React from 'react'

const CursorChat = ({cursor, cursorState, setCursorState, updateMyPresence} : CursorChatProps) => {

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      setCursorState({mode : CursorMode.Chat, previousMessage: cursorState.message, message: ""});
    } else if (event.key === 'Escape') {
      setCursorState({mode : CursorMode.Hidden});
    }
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateMyPresence({ message: event.target.value });
    setCursorState({ mode: CursorMode.Chat, message: event.target.value, previousMessage: null }); 
  }

  return (
    <div className='absolute top-0 left-0' style={{ transform: `translateX(${cursor.x}px) translateY(${cursor.y}px)`}}>
      {cursorState.mode === CursorMode.Chat && (
        <>
        <CursorSVG color='#fff'/>
        <div className='absolute left-2 top-5 bg-blue-500 px-4 py-2 text-sm leading-relaxed text-white rounded-3xl'>
          {cursorState.previousMessage && ( <div>{cursorState.previousMessage}</div>)}
          <input className='z-10 w-60 border-none bg-transparent text-white placeholder-blue-300 outline-none' 
          autoFocus={true}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={cursorState.previousMessage? "" : "Write a message"}
          value={cursorState.message}
          maxLength={50}/>
        </div>
        </>
      )}
    </div>
  )
}

export default CursorChat