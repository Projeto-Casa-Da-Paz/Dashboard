import { CloseButton, Toast as ToastBootstrap, ToastProps } from "react-bootstrap";

interface IProps extends ToastProps {
    message: string
    colors?: string
}

export const Toast = (props: IProps) => {
    return (
        <ToastBootstrap
            show={props.show}
            onClose={props.onClose}
            delay={5000}
            bg={props?.colors ? props.colors : 'success'}
            autohide
            style={{
                position: 'absolute',
                zIndex: 100,
                right: 0,
                margin: '7px'
            }}
        >
            <ToastBootstrap.Body
                style={{
                    color: "#FFF"
                }}
            >
                {props.message}
                <CloseButton 
                    style={{
                        color: "#FFF",
                        float: 'right'
                    }}
                    variant="white"
                    onClick={props.onClose}
                />
            </ToastBootstrap.Body>
        </ToastBootstrap>
    )
}