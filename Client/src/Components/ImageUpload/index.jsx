import { useState, useRef } from "react";
import { Box, Button, Stack } from "@mui/material";
import ImageField from "../Inputs/Image";
import ProgressUpload from "../ProgressBars";
import { formatBytes } from "../../Utils/fileUtils";
import { imageValidation } from "../../Validation/validation";
import ImageIcon from "@mui/icons-material/Image";
import {GenericDialog} from "../Dialog/genericDialog";

const isValidBase64Image = (data) => {
    return /^[A-Za-z0-9+/=]+$/.test(data);
  };

const ImageUpload = ({ 
    open,
    onClose,
    onUpdate,
    currentImage,
    theme,
    shouldRender = true,
    alt = "Uploaded Image",
    width = "auto",
    height = "auto",
    minWidth = "auto",
    minHeight = "auto",
    maxWidth = "auto",
    maxHeight = "auto",
    placeholder,
    sx
 }) => {
  const [file, setFile] = useState();
  const [progress, setProgress] = useState({ value: 0, isLoading: false });
  const [errors, setErrors] = useState({});
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

  // Handles image file selection
  const handlePicture = (event) => {
    const pic = event.target.files[0];
    let error = validateField({ type: pic.type, size: pic.size }, imageValidation);
    if (error) return;

    setProgress((prev) => ({ ...prev, isLoading: true }));
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
    setFile({ delete: true });
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
      open={open}
      onClose={onClose}
      theme={theme} // Pass the theme prop
      title={"Upload Image"}
      description={"Select an image to upload."}
      confirmationButtonLabel={"Update"}
      onConfirm={handleUpdatePicture}
      isLoading={false}
    >
        <Box
        component="img"
        src={imageSrc}
        alt={alt}
        minWidth={minWidth}
        minHeight={minHeight}
        maxWidth={maxWidth}
        maxHeight={maxHeight}
        width={width}
        height={height}
        sx={{ ...sx }}
      />
      <ImageField
        id="update-profile-picture" // Add the required id prop
        src={
            file?.delete
            ? ""
            : file?.src
                ? file.src
                : currentImage
                ? currentImage
                : ""
        }
        loading={progress.isLoading && progress.value !== 100}
        onChange={handlePicture}
        />
      {progress.isLoading || progress.value !== 0 || errors["picture"] ? (
        <ProgressUpload
          icon={<ImageIcon />}
          label={file?.name}
          size={file?.size}
          progress={progress.value}
          onClick={removePicture}
          error={errors["picture"]}
        />
      ) : (
        ""
      )}
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