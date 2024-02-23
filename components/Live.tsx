import React, { useCallback, useEffect, useState } from 'react'
import LiveCursors from './cursor/LiveCursors'
import { useBroadcastEvent, useEventListener, useMyPresence, useOthers } from '@/liveblocks.config'
import CursorChat from './cursor/CursorChat';
import { CursorMode, CursorState, Reaction, ReactionEvent } from '@/types/type';
import ReactionSelector from './reaction/ReactionButton';
import FlyingReaction from './reaction/FlyingReaction';
import useInterval from '@/hooks/useInterval';

const Live = () => {
    const others = useOthers();
    const [{ cursor }, updateMyPresence] = useMyPresence() as any;
    const [cursorState, setcursorState] = useState<CursorState>({ mode: CursorMode.Hidden });
    const [reaction, setreaction] = useState<Reaction[]>([])
    const broadcast = useBroadcastEvent();

    
    const setReaction = useCallback((reaction: string) => {
        setcursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
    }, []);

    useInterval(() => {
        setreaction((reactions) => reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000));
      }, 1000);
    
      // Broadcast the reaction to other users (every 100ms)
      useInterval(() => {
        if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
          // concat all the reactions created on mouse click
          setreaction((reactions) =>
            reactions.concat([
              {
                point: { x: cursor.x, y: cursor.y },
                value: cursorState.reaction,
                timestamp: Date.now(),
              },
            ])
          );
    
          // Broadcast the reaction to other users
          broadcast({
              x: cursor.x,
              y: cursor.y,
              value: cursorState.reaction,
            });
        }
    }, 100);

      useEventListener((eventData) => {
        const event = eventData.event as ReactionEvent;
        setreaction((reactions) =>
          reactions.concat([
            {
              point: { x: event.x, y: event.y },
              value: event.value,
              timestamp: Date.now(),
            },
          ])
        );
      });

    const handlePointerMove = useCallback((event: React.PointerEvent) => {
        event.preventDefault();
        if (cursor == null || cursorState.mode !== CursorMode.ReactionSelector) {
            const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
            const y = event.clientY - event.currentTarget.getBoundingClientRect().y;
            updateMyPresence({ cursor: { x, y } });
        }
    }, [])

    const handlePointerDown = useCallback((event: React.PointerEvent) => {
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

        updateMyPresence({ cursor: { x, y } });

        setcursorState((state: CursorState) =>
            cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
        )
    }, [cursorState.mode, setcursorState])

    const handlePointerUp = useCallback((event: React.PointerEvent) => {
        setcursorState((state: CursorState) =>
            cursorState.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
        )
    }, [cursorState.mode, setcursorState])

    const handlePointerLeave = useCallback((event: React.PointerEvent) => {
        setcursorState({ mode: CursorMode.Hidden });

        updateMyPresence({ cursor: null, message: null });
    }, [])

    useEffect(() => {
        const onKeyUp = (event: KeyboardEvent) => {
            if (event.key === '/') {
                setcursorState({ mode: CursorMode.Chat, previousMessage: null, message: "" });
            } else if (event.key === 'Escape') {
                updateMyPresence({ message: "" })
                setcursorState({ mode: CursorMode.Hidden });
            } else if (event.key === "e") {
                setcursorState({ mode: CursorMode.ReactionSelector });
            }
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === '/') {
                event.preventDefault();
            }
        }
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('keydown', onKeyDown);

        return () => {
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('keydown', onKeyDown);
        }
    }, [updateMyPresence])


    return (
        <div
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className='h-screen w-full flex justify-center items-center text-center border-2 border-green-300'
        >
            <h1 className="text-3xl font-bold text-white">Liveblocks Figma</h1>

            {reaction.map((r)=> (
                <FlyingReaction
                key={r.timestamp.toString()}
                x={r.point.x}
                y={r.point.y}
                timestamp={r.timestamp}
                value={r.value} />
            ))}

            {cursor && (<CursorChat
                cursor={cursor}
                cursorState={cursorState}
                setCursorState={setcursorState}
                updateMyPresence={updateMyPresence} />)}

            {/* If cursor is in reaction selector mode, show the reaction selector */}
            {cursorState.mode === CursorMode.ReactionSelector && (
                <ReactionSelector
                    setReaction={setReaction}
                />
            )}
            <LiveCursors others={others} />
        </div>
    )
}

export default Live