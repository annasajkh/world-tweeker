/* eslint-disable prettier/prettier */

import IconButton from "./IconButton"
import RunButton from './RunButton'
import './Topbar.css'
import { Link } from "react-router-dom"

interface Props {
    runButtonClicked: () => void;
}


export default function Topbar({ runButtonClicked }: Props): JSX.Element {

    return (
        <div className="top-bar">
            <RunButton onClick={runButtonClicked} />
            <Link to="/settings">
                <IconButton onClick={() => { }} className={""} src={"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAE8klEQVR4nO2dz29VRRTHSwJE2q1ViC0aQVQkASEUNrAV/wBiAhstjwKBHSSoiQtQWGDcw4qEBZaA/glKJNEEEoMRSUoaxV8NBGhCDVQh9WPGHuJt7aPv5c6ZM1POJ2EDt/T7nfPevTNnzpzb0eE4juM4juM4jpMRwMvAOeAW7XNLfnaFtY8iAV4BRqnPnRBIaz/FAXxOPD6z9lMUwFPAXxEDEP6vRda+igHoIz591r6KAditEIDd1r6KATihEIAT1r6KAbikEIBL1r6KAJgPjCsE4E9ggbW/7AFWo8dqa3/ZAnQBA8D3igG4Ir+jy9pvbgP/nqxYU3FHfmfXXLt3rwR6W7x+HvAOcAM7boiGeS1qfh54Lbtniczbq3mb68AxYG2T65cDX5IP54OmJlrXAR8Dv1SuD173dOQA0JjF3BBwCHhVrt8K3CU/7gJvicbwKf8QuDbLzzSsB38xMNaGyWHy58c2rg3el1gG4KTiQJTCSavBXwtMWLvPgL+TJ/pkBnPB2nlGfNPqTCpWALZbO86Q7akGfxHws7XbDPktycIOOGztNGMOaw9+L3DP2mXG3Ade0AzAGWuHBXBGa/A3yZTLcqV6Wlbe64HukJORP93ydzvlmnYWhxps1ghAyJdYMAT0A51taO0EdrSQStDifOzBf9bg038f2B+yrDV0h2/HAaUdtscRxuqZmAFYltjANWBVRP0bgJHEHpbFzvXfTCT823BPjyb+Pw/PAZcTebhZ55vbzMC+RJ/87qjCp3roSfRN2Ktl4IjyPX+VivCpHjYqPxOOahsIm9oPFYTvVxU+1cMHCvrDmAykMrAl8lx7KPo9c/ZCgJi3ojAWb6bS/8jEGklAxaC/4PrT34HXU+uv5oauRljhdhpo74zwLb7aahWIppFTNU2cNtT+aU3tp6y0V03U3RlrGGoPuaM6XLDSXjURaoDqsL7ggyDXrbRXTdQtKXzaUHvIotZh1Ep71cSDmiYWGmpfWFP7AyvtVRMeAEv8FlT+Q7jPUHtIUxf/EK47Dd1pqD3ktYqfhpa8EBsseiEm+fUfapoYM0pFhITcHxFSET2ptVcP05WcjGtE0h7GYE1q8W8opKMXJJ7/xzyrEMZiS8r8icaGzIEkBiY9HFTQ/1B9QgF8hB7jYVqYaEsyHNrW4oiW8BSb8iOaD7WEm/L7YgtPWZZyWSMIMvjfFVmWYlCYNRJuFZFvO0UXZlmUJo5L9UJXzdLEg8WXJhoX547IBnq7xbkNw2OxcYtzMylPH5M93AHZyZpent4n/zYYYYVbhzBGm6IHQILgBzRmZ1Bl8CUAfkTJ8oiSBCH0fXBm5pDq4EsA/Jiq5TFVCYIf1P4/25IMfqVVwVcziHhS+TppqwIJgjfrmGTCbF/b29UYtquRACxpc2PmJ/JnuJiGTS1u7Q3LPsK/x49CW7CMW5ZtFY0rpSdG2KnLt2XZI0IDu2lN+34FPmlWeAu8ZJhbmokvgBcf86w7Nq1DzGh2zcAlJxM+OUtbmRHITKo/4T5Ds7aVb7fRtrJXPCY7TpWqPOT9SK8raZVQ0f3unGrcGrF18ZUErYuT1yEVA9682zwA8719vX0QLircfi5a+yoG4LhCAI5b+yoGYJdCAHZZ+yoGJtuPxcbsNGZx4C9ym3OvMjxn7ac48Jd5Fv8629vAWX+dreM4juM4juM4HZnxDzqrI5i25MR4AAAAAElFTkSuQmCC"} />
            </Link>
        </div>
    )
}