/* eslint-disable prettier/prettier */
// Modal as a separate component

import { ReactNode, useEffect, useRef } from "react";
import "./Modal.css"
import IconButton from "./IconButton";


interface Props {
    haveCloseButton: boolean,
    canClose: boolean,
    className: string,
    openModal: boolean,
    closeModal: () => void,
    children: ReactNode
}

export default function Modal({ haveCloseButton, canClose, className, openModal, closeModal, children }: Props): JSX.Element {
    const ref = useRef<HTMLDialogElement>(null);
    const allowDialogDismiss: boolean = false;
    
    useEffect(() => {
        if (openModal) {
            ref.current?.showModal();
        } else {
            ref.current?.close();
        }
    }, [openModal]);

    const handleKeyDown = (event: KeyboardEvent): void => {
        if (event.key !== 'Escape') {
            return;
        }

        if (!allowDialogDismiss) {
            event.preventDefault();
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [allowDialogDismiss]);

    return (
        <dialog className={`modal ${className}`} ref={ref} onCancel={closeModal}>
            {haveCloseButton ? <IconButton className="modal-close-button" onClick={canClose ? closeModal : (): void => { }} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAAsTAAALEwEAmpwYAAABfklEQVR4nO2aW07DMBREvSsey4AuCARqJFp+YQfdJTrIwkitlBLH9nVsM+e7zXjGjyT3xjkhhBBCCCGEEOsAdsAncATuXCWA+6DptR9r6V4AnLjkC3hyxniNoHXOyVp3buavsXdG+Gv/oVtvJfCz9KgZwoJ5z0dpzauE/bfEwRUCeInQeyult4g/8Gb2oclKiJh5wlhuc7VSDiMsQ4g0T43DN2dpJm0Hy2sXBYOBdmPeYsDdmS858G7NlzDQvfkcI8OYT7h97Vf8dnI9QfysjjPzRiH0ab5QCH2bzwxhDPOJIYxlPiGAoxsJ0rbAGCGQdwj2HQJlboN9hkDZB6G+QmDFsz3wOlQI2L4MtR0CdV6H2wyBugWRtkJgm5JYGyGwbVF02xBooyy+TQjEN0aSKzn+v5Eaz2XdlWuNZZexIkOo2xoD3htsjh5aao9PBppTS+3xXU3zkSE8WOnO8q8/kfnFpx62g3+puXGV8Afe2UdSdWdeCCGEEEIIIdwAfAMdebC9a2hz6AAAAABJRU5ErkJggg==" /> : <></>}
            <div className="modal-content">
                {children}
            </div>
        </dialog>
    );
}