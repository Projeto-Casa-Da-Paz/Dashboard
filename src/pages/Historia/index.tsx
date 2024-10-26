import { Loading } from "../../components/Loading";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { LayoutDashboard } from "../../components/LayoutDashboard";
import Editor from "../../components/Editor";



export default function Historia() {
    const [range, setRange] = useState();
    const [lastChange, setLastChange] = useState();
    const [readOnly, setReadOnly] = useState(false);
    const [loading, setLoading] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [message, setMessage] = useState("");
    const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
    const navigate = useNavigate();




    return (
        <>
            <Loading visible={loading} />
            <LayoutDashboard>
                <h1>Historia</h1>
                <Editor />
            </LayoutDashboard>
        </>
    )
}