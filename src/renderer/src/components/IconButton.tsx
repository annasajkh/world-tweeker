/* eslint-disable prettier/prettier */
import React from 'react';
import './IconButton.css'

type Props = {
    className: string
    src: string
    onClick: () => void
}

const IconButton = React.forwardRef<HTMLDivElement, Props>((props, ref) => {
    const { className, src, onClick } = props;
    return (
        <div ref={ref} className={`icon-button ${className}`} onClick={onClick}>
            <img src={src} className="icon-button-image" />
        </div>
    )
})

IconButton.displayName = 'IconButton';

export default IconButton;
