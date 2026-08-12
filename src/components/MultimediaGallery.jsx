import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

export default function MultimediaGallery({
  open,
  onClose,
  fotos,
  titulo,
  index,
  setIndex,
  onDelete,
  userRole,
}) {
  const nextFoto = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev === fotos.length - 1 ? 0 : prev + 1));
  };

  const prevFoto = (e) => {
    e.stopPropagation();
    setIndex((prev) => (prev === 0 ? fotos.length - 1 : prev - 1));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: "#1e293b",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {titulo}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          bgcolor: "#0f172a",
          p: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "500px",
          position: "relative",
        }}
      >
        {fotos && fotos.length > 0 ? (
          <>
            {/* Botón Eliminar (Solo si se pasa la función onDelete y es admin) */}
            {userRole === "admin" && onDelete && (
              <IconButton
                onClick={() => onDelete(fotos[index])}
                sx={{
                  position: "absolute",
                  top: 15,
                  right: 15,
                  color: "white",
                  bgcolor: "rgba(220, 38, 38, 0.8)",
                  "&:hover": { bgcolor: "rgba(220, 38, 38, 1)" },
                  zIndex: 10,
                }}
              >
                <DeleteIcon />
              </IconButton>
            )}

            {fotos.length > 1 && (
              <IconButton
                onClick={prevFoto}
                sx={{
                  position: "absolute",
                  left: 15,
                  color: "white",
                  bgcolor: "rgba(0,0,0,0.3)",
                  zIndex: 5,
                }}
              >
                <ArrowBackIosNewIcon />
              </IconButton>
            )}

            <Box
              sx={{
                width: "100%",
                height: "550px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 1,
              }}
            >
              <img
                src={fotos[index]?.foto_url}
                alt="Galería"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  borderRadius: "4px",
                }}
              />
            </Box>

            {fotos.length > 1 && (
              <IconButton
                onClick={nextFoto}
                sx={{
                  position: "absolute",
                  right: 15,
                  color: "white",
                  bgcolor: "rgba(0,0,0,0.3)",
                  zIndex: 5,
                }}
              >
                <ArrowForwardIosIcon />
              </IconButton>
            )}

            <Typography
              sx={{
                position: "absolute",
                bottom: 15,
                color: "white",
                bgcolor: "rgba(0,0,0,0.5)",
                px: 2,
                py: 0.5,
                borderRadius: 5,
              }}
            >
              {index + 1} / {fotos.length}
            </Typography>
          </>
        ) : (
          <Typography color="white">No hay imágenes.</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
