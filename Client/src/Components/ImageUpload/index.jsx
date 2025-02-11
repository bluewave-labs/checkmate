import { useState, useRef } from "react";
import { Box, Button, Stack, IconButton, TextField , Typography } from "@mui/material";
import ProgressUpload from "../ProgressBars";
import { formatBytes } from "../../Utils/fileUtils";
import { imageValidation } from "../../Validation/validation";
import ImageIcon from "@mui/icons-material/Image";
import {GenericDialog} from "../Dialog/genericDialog";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { checkImage } from "../../Utils/fileUtils";
import "./index.css";

const isValidBase64Image = (data) => {
    return /^[A-Za-z0-9+/=]+$/.test(data);
  };

const ImageUpload = ({ open, onClose, onUpdate, currentImage, theme, shouldRender = true, placeholder,}) => {
  const [file, setFile] = useState();
  const [progress, setProgress] = useState({ value: 0, isLoading: false });
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const intervalRef = useRef(null);

  // Handle base64 and placeholder logic
  let imageSrc = currentImage;

  if (typeof file?.src !== "undefined") {
    imageSrc = file.src;
  } else if (typeof currentImage !== "undefined" && isValidBase64Image(currentImage)) {
    imageSrc = `data:image/png;base64,${currentImage}`;
  } else if (typeof placeholder !== "undefined") {
    imageSrc = placeholder;
  }

  if (shouldRender === false) {
    return null;
  }

  const handleDragEnter = (event) => {
    event.preventDefault();
    setIsDragging(true);
};

const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
};

const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (event.dataTransfer.files.length > 0) {
        handlePicture({ target: { files: event.dataTransfer.files } });
    }
};

  // Handles image file selection
  const handlePicture = (event) => {
    const pic = event.target.files[0];
    if (!pic) return;

    event.target.value = "";
    setFile(null);
  
    // Validate file type and size
    let error = validateField({ type: pic.type, size: pic.size }, imageValidation);
    if (error) return;
  
    setProgress({ value: 0, isLoading: true });
    setFile({
      src: URL.createObjectURL(pic),
      name: pic.name,
      size: formatBytes(pic.size),
      delete: false,
    });
  
    // Simulate upload progress
    intervalRef.current = setInterval(() => {
      const buffer = 12;
      setProgress((prev) => {
        if (prev.value + buffer >= 100) {
          clearInterval(intervalRef.current);
          return { value: 100, isLoading: false };
        }
        return { ...prev, value: prev.value + buffer };
      });
    }, 120);
  };

  // Validates input against provided schema and updates error state
  const validateField = (toValidate, schema, name = "picture") => {
    const { error } = schema.validate(toValidate, { abortEarly: false });
    setErrors((prev) => {
      const prevErrors = { ...prev };
      if (error) prevErrors[name] = error.details[0].message;
      else delete prevErrors[name];
      return prevErrors;
    });
    if (error) return true;
  };

  // Resets picture-related states and clears interval
  const removePicture = () => {
    errors["picture"] && setErrors((prev) => ({ ...prev, picture: undefined }));
    setFile(null);
    clearInterval(intervalRef.current);
    setProgress({ value: 0, isLoading: false });
  };

  // Updates the profile picture and closes the modal
  const handleUpdatePicture = () => {
    setProgress({ value: 0, isLoading: false });
    onUpdate(file.src); // Pass the new image URL to the parent component
    onClose(); // Close the modal
  };

  return (
    <GenericDialog
        id="modal-update-picture"
        open={open}
        onClose={onClose}
        theme={theme}
        title={"Upload Image"}
        description={"Select an image to upload."}
        confirmationButtonLabel={"Update"}
        onConfirm={handleUpdatePicture}
        isLoading={false}
        >
        <Box
            className="image-field-wrapper"
            sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "180px",
                maxHeight: "220px",
                border: "dashed",
                borderRadius: theme.shape.borderRadius,
                borderColor: isDragging ? theme.palette.primary.main : theme.palette.primary.lowContrast,
                borderWidth: "2px",
                transition: "0.2s",
                "&:hover": {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: "hsl(215, 87%, 51%, 0.05)",
                },
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
        >
        <input
            id="update-profile-picture"
            type="file"
            onChange={handlePicture}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: "pointer",
                zIndex: 3,  
                pointerEvents: "all",
            }}
        />

        {!checkImage(file?.src || currentImage) || progress.isLoading ? (
            <>
                <Stack
                    className="custom-file-text"
                    alignItems="center"
                    gap="4px"
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1,
                        width: "100%",
                    }}
                >
                    <IconButton
                        sx={{
                            pointerEvents: "none",
                            borderRadius: theme.shape.borderRadius,
                            border: `solid ${theme.shape.borderThick}px ${theme.palette.primary.lowContrast}`,
                            boxShadow: theme.shape.boxShadow,
                        }}
                    >
                        <CloudUploadIcon />
                    </IconButton>
                    <Typography component="h2" color={theme.palette.primary.contrastTextTertiary}>
                        <Typography component="span" fontSize="inherit" color="info" fontWeight={500}>
                        Click to upload
                        </Typography>{" "}
                        or drag and drop
                    </Typography>
                    <Typography
                        component="p"
                        color={theme.palette.primary.contrastTextTertiary}
                        sx={{ opacity: 0.6 }}
                    >
                        (maximum size: 3MB)
                    </Typography>
                </Stack>
            </>
        ) : (
            <Box
                sx={{
                    width: "150px",
                    height: "150px",
                    overflow: "hidden",
                    backgroundImage: `url(${file?.src || currentImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            />
        )}
        </Box>

        {progress.isLoading || progress.value !== 0 || errors["picture"] ? (
            <ProgressUpload
            icon={<ImageIcon />}
            label={file?.name}
            size={file?.size}
            progress={progress.value}
            onClick={removePicture}
            error={errors["picture"]}
            />
        ) : null}

        <Stack
            direction="row"
            mt={2}
            gap={2}
            justifyContent="flex-end"
        >
            <Button
            variant="text"
            color="info"
            onClick={removePicture}
            >
            Remove
            </Button>
            <Button
            variant="contained"
            color="accent"
            onClick={handleUpdatePicture}
            disabled={
                (Object.keys(errors).length !== 0 && errors?.picture) ||
                progress.value !== 100
                ? true
                : false
            }
            >
            Update
            </Button>
        </Stack>
    </GenericDialog>
  );
};

export default ImageUpload;