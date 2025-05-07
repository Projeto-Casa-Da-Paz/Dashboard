import React, { useState } from "react";
import { Box, Button, Popover, TextField } from "@mui/material";
import { SketchPicker } from "react-color";

const ColorPicker = ({ initialColor, onChange }: any) => {
    const [color, setColor] = useState(initialColor || "#000");
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget as HTMLElement);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleChangeComplete = (newColor: { hex: string }) => {
        setColor(newColor.hex);
        onChange && onChange(newColor.hex);
    };

    const open = Boolean(anchorEl);
    const id = open ? "color-picker-popover" : undefined;

    return (
        <Box>
            <TextField
                value={color}
                onClick={handleClick}
                fullWidth
                slotProps={{
                    input: {
                        readOnly: true,
                    },
                }}
                sx={{
                    overflow: "hidden", // Garante que o background fique dentro das bordas
                    borderRadius: "8px", // Bordas arredondadas para o TextField
                    input: {
                        cursor: "pointer",
                        backgroundColor: color,
                        color: "#fff",
                        fontWeight: "bold",
                    },
                    "& .MuiOutlinedInput-root": {
                        borderRadius: "8px", // Bordas do contorno
                        "& fieldset": {
                            borderColor: "#C0C0C0", // Cor cinza da borda
                        },
                        "&:hover fieldset": {
                            borderColor: "#A0A0A0", // Borda mais escura ao passar o mouse
                        },
                        "&.Mui-focused fieldset": {
                            borderColor: "#808080", // Borda cinza ao focar
                        },
                    },
                }}
            />
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
            >
                <SketchPicker color={color} onChangeComplete={handleChangeComplete} />
                <Button onClick={handleClose} sx={{ mt: 1, width: "100%" }}>
                    Confirmar
                </Button>
            </Popover>
        </Box>
    );
};

export default ColorPicker;
