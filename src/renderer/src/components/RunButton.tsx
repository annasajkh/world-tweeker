/* eslint-disable prettier/prettier */

import './RunButton.css'

interface Props {
    onClick: () => void
}

export default function RunButton({ onClick }: Props): JSX.Element {
    return (
        <div className="run-button" onClick={onClick}>
            <img className="run-button-image" src={"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA+klEQVR4nGNgGAUDCez3hx213x920WFfuD9dLXY4EP4fCR+33x9qMxAW/4fgsM32+0NVBsDi8P8O+8N+2e8Pm+l6NEaMvhYfgOPP9vvDGyyOhXLS2+L/0OB/7HggPC10VSgznS0OB2P7A2FXHA+EedHdYgcE3u24N0x/ICz+b78/7K/DgfBVjnuj5OlqsQPcAeFf7feHdbjsDuWnq8WI+A9/43AgvDz0SigbXS1GCoGDI8XisNd0DWpY4vI4Ec1H0MKhnJ1207UAsad/kRlG50pif9g7UEq13x/PQRULYWDwNAT2h/+DpNRwZZpYOBgae4cHpHk7ChhoAABlLc9V+rEX9gAAAABJRU5ErkJggg=="} />
            <p className="run-button-text">Run Oneshot</p>
        </div>
    )
}
