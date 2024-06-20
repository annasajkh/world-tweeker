/* eslint-disable prettier/prettier */

import IconButton from "./IconButton"
import TextAndIconButton from "./TextAndIconButton";
import './Topbar.css'
import { Link } from "react-router-dom"

type Props = {
    runButtonClicked: () => void;
    importModClicked: () => void;
}

export default function Topbar(props: Props): JSX.Element {
    return (
        <div className="top-bar">
            <div className="top-bar-left">
                <TextAndIconButton className="load-oneshot-button" text="Run Oneshot" onClick={props.runButtonClicked} iconBase64="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA+klEQVR4nGNgGAUDCez3hx213x920WFfuD9dLXY4EP4fCR+33x9qMxAW/4fgsM32+0NVBsDi8P8O+8N+2e8Pm+l6NEaMvhYfgOPP9vvDGyyOhXLS2+L/0OB/7HggPC10VSgznS0OB2P7A2FXHA+EedHdYgcE3u24N0x/ICz+b78/7K/DgfBVjnuj5OlqsQPcAeFf7feHdbjsDuWnq8WI+A9/43AgvDz0SigbXS1GCoGDI8XisNd0DWpY4vI4Ec1H0MKhnJ1207UAsad/kRlG50pif9g7UEq13x/PQRULYWDwNAT2h/+DpNRwZZpYOBgae4cHpHk7ChhoAABlLc9V+rEX9gAAAABJRU5ErkJggg==" />
                <TextAndIconButton className="import-mod-button" text="Import Mod" onClick={props.importModClicked} iconBase64="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAADq0lEQVR4nO2dS0tVURSA7ylLNIIaCD1+Qk4K0r8Q0ajHpFnC1UlNHETRNCRqpr9Bk2rUz4hQqElK0AsLIwKlbg8vfbVxR7fjETwvz9prrw/uwMvZ62zWt89jv7ytVk4Ily5wuaUNwqarTgrh01UlBR101UghXDYy/r7UCh3C5QLwU92VQrgkwHl1UgiXxNdflxQCF6JOCgqEqJKCEiFqpKBIiAopKBMSvBQUCglaCkqFBCsFxUKClIJyIcFJIQIhQUkhEiHBSCEiIUFIITIh4qUQoRDRUohUiFgpRCxEpBQiFyJOCuGSVJwHGVIIl6SGXDQvhXBJaspHs1IIl6TGnDQnhXBJas5L1rqvjbrPG7KQpjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjAhwjhi+0Nk8QW4AxyyDTuy+AictR1U1bEGzAFtYAQYAvr9Z8h/1/bHuGOz+AXcBfbalrbivADGgIEc2/4GfJmlbWLOAn22xzAfHWCyTOJcWR/DxUrzsJIrhTh4725BlbTgzZydBN5knOd2FcG1swgcr8TE/3k7BixkPFPOlQ2smRWXuMosbM2de/gvp875AThYJqhWvgGjOfLgWneRf0N7AviaKjtlQrYymbNhFhLiy97KaAxHC0lB76tt3y4KGfS3x15umpB/XCnQMAsL8eXHU+VfFhqIRB9rrsU2IMRdJeupGKfy1kOjkNncSahAiI9xPxXjWpGKaKPdoBA39tXLfJGKaGOkQSGjqRiLRSqijaEdJryO38ByHcVe3pkQ6G9QyP7UMR0TgighP0wIom5Zn0wIjT7U3SxjL89NCKJeex+ZEJhrUMh8KsYNE4KooZP8t090MiZgcPEtsCdvPbQKWRIw/F5skgq9TDY4QfW98NQxeukAp+sWAgxnTOHOFJKhXMhuLXJIL55bBQ6XCaqdhe167xXIeJpxvotlA8fAsru1VChjOGP5j2O6iuCx0PEP38ESuRr0MbKWkj6uZH0v8bECTOQR40VMZLza9srY8eJtE5LNup8DH+/ZjrDPf/5uRxj3wyHpHngv05WtfI8B4AzwiupZLf0AjxXgAHAvo79QBNfpmyn1amts4pIIXAdeFxDhxqam6uzXRAuQ+EXSV4EHwBO/38O9PblfZvsMPHPzGW4I3T9P8g8U/jnZb8B9MvmtIjchAAAAAElFTkSuQmCC" />
            </div>
            
            <Link to="/settings">
                <IconButton onClick={() => { }} className={"settings-button"} src={"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAE8klEQVR4nO2dz29VRRTHSwJE2q1ViC0aQVQkASEUNrAV/wBiAhstjwKBHSSoiQtQWGDcw4qEBZaA/glKJNEEEoMRSUoaxV8NBGhCDVQh9WPGHuJt7aPv5c6ZM1POJ2EDt/T7nfPevTNnzpzb0eE4juM4juM4jpMRwMvAOeAW7XNLfnaFtY8iAV4BRqnPnRBIaz/FAXxOPD6z9lMUwFPAXxEDEP6vRda+igHoIz591r6KAditEIDd1r6KATihEIAT1r6KAbikEIBL1r6KAJgPjCsE4E9ggbW/7AFWo8dqa3/ZAnQBA8D3igG4Ir+jy9pvbgP/nqxYU3FHfmfXXLt3rwR6W7x+HvAOcAM7boiGeS1qfh54Lbtniczbq3mb68AxYG2T65cDX5IP54OmJlrXAR8Dv1SuD173dOQA0JjF3BBwCHhVrt8K3CU/7gJvicbwKf8QuDbLzzSsB38xMNaGyWHy58c2rg3el1gG4KTiQJTCSavBXwtMWLvPgL+TJ/pkBnPB2nlGfNPqTCpWALZbO86Q7akGfxHws7XbDPktycIOOGztNGMOaw9+L3DP2mXG3Ade0AzAGWuHBXBGa/A3yZTLcqV6Wlbe64HukJORP93ydzvlmnYWhxps1ghAyJdYMAT0A51taO0EdrSQStDifOzBf9bg038f2B+yrDV0h2/HAaUdtscRxuqZmAFYltjANWBVRP0bgJHEHpbFzvXfTCT823BPjyb+Pw/PAZcTebhZ55vbzMC+RJ/87qjCp3roSfRN2Ktl4IjyPX+VivCpHjYqPxOOahsIm9oPFYTvVxU+1cMHCvrDmAykMrAl8lx7KPo9c/ZCgJi3ojAWb6bS/8jEGklAxaC/4PrT34HXU+uv5oauRljhdhpo74zwLb7aahWIppFTNU2cNtT+aU3tp6y0V03U3RlrGGoPuaM6XLDSXjURaoDqsL7ggyDXrbRXTdQtKXzaUHvIotZh1Ep71cSDmiYWGmpfWFP7AyvtVRMeAEv8FlT+Q7jPUHtIUxf/EK47Dd1pqD3ktYqfhpa8EBsseiEm+fUfapoYM0pFhITcHxFSET2ptVcP05WcjGtE0h7GYE1q8W8opKMXJJ7/xzyrEMZiS8r8icaGzIEkBiY9HFTQ/1B9QgF8hB7jYVqYaEsyHNrW4oiW8BSb8iOaD7WEm/L7YgtPWZZyWSMIMvjfFVmWYlCYNRJuFZFvO0UXZlmUJo5L9UJXzdLEg8WXJhoX547IBnq7xbkNw2OxcYtzMylPH5M93AHZyZpent4n/zYYYYVbhzBGm6IHQILgBzRmZ1Bl8CUAfkTJ8oiSBCH0fXBm5pDq4EsA/Jiq5TFVCYIf1P4/25IMfqVVwVcziHhS+TppqwIJgjfrmGTCbF/b29UYtquRACxpc2PmJ/JnuJiGTS1u7Q3LPsK/x49CW7CMW5ZtFY0rpSdG2KnLt2XZI0IDu2lN+34FPmlWeAu8ZJhbmokvgBcf86w7Nq1DzGh2zcAlJxM+OUtbmRHITKo/4T5Ds7aVb7fRtrJXPCY7TpWqPOT9SK8raZVQ0f3unGrcGrF18ZUErYuT1yEVA9682zwA8719vX0QLircfi5a+yoG4LhCAI5b+yoGYJdCAHZZ+yoGJtuPxcbsNGZx4C9ym3OvMjxn7ac48Jd5Fv8629vAWX+dreM4juM4juM4HZnxDzqrI5i25MR4AAAAAElFTkSuQmCC"} />
            </Link>
        </div>
    )
}