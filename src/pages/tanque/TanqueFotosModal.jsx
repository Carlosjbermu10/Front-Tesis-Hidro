import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Grid,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Swal from "sweetalert2";
import tanqueService from "../../services/tanqueService.js";

export default function TanqueFotosModal({
  open,
  onClose,
  tanque,
  userRole,
  onSuccess,
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      Swal.fire(
        "Límite excedido",
        "Solo puedes subir hasta 5 fotos a la vez.",
        "warning",
      );
      return;
    }
    setSelectedFiles(files);

    // Crear URLs de previsualización locales
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    try {
      setUploading(true);
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("image", file); // Debe coincidir con 'upload.array("image", 5)'
      });

      await tanqueService.addFotosTanque(tanque.id_tanque, formData);
      Swal.fire({
        icon: "success",
        title: "Fotos subidas",
        timer: 1500,
        showConfirmButton: false,
      });
      setSelectedFiles([]);
      setPreviewUrls([]);
      onSuccess(); // Recarga la pestaña para ver la nueva foto
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "No se pudieron subir las fotos.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFoto = async (idFoto) => {
    const result = await Swal.fire({
      title: "¿Eliminar fotografía?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Sí, eliminar",
    });

    if (result.isConfirmed) {
      try {
        await tanqueService.deleteFotoTanque(idFoto);
        Swal.fire({
          icon: "success",
          title: "Foto eliminada",
          timer: 1500,
          showConfirmButton: false,
        });
        onSuccess(); // Recarga para remover la foto de la vista
      } catch (error) {
        console.log(error);
        Swal.fire("Error", "No se pudo eliminar la foto.", "error");
      }
    }
  };

  // Limpiar estados al cerrar
  const handleClose = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    onClose();
  };

  if (!tanque) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ bgcolor: "#2563eb", color: "white", fontWeight: "bold" }}
      >
        Galería Multimedia - Tanque #{tanque.id_tanque}
      </DialogTitle>

      <DialogContent dividers>
        {/* ZONA DE SUBIDA (Solo Admin y Supervisor) */}
        {(userRole === "admin" || userRole === "supervisor") && (
          <Box
            sx={{
              mb: 4,
              p: 3,
              border: "2px dashed #cbd5e1",
              borderRadius: 2,
              textAlign: "center",
              bgcolor: "#f8fafc",
            }}
          >
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="upload-button-file"
              multiple
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="upload-button-file">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                disabled={uploading}
              >
                Seleccionar Fotos (Max 5)
              </Button>
            </label>

            {previewUrls.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Previsualización:
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    justifyContent: "center",
                    flexWrap: "wrap",
                    mb: 2,
                  }}
                >
                  {previewUrls.map((url, idx) => (
                    <Box
                      key={idx}
                      component="img"
                      src={url}
                      sx={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 1,
                      }}
                    />
                  ))}
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Subir al Servidor"
                  )}
                </Button>
              </Box>
            )}
          </Box>
        )}

        {/* GALERÍA ACTUAL */}
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: "bold", color: "text.secondary" }}
        >
          Fotografías Registradas ({tanque.fotos?.length || 0})
        </Typography>

        {tanque.fotos && tanque.fotos.length > 0 ? (
          <Grid container spacing={2}>
            {tanque.fotos.map((foto) => (
              <Grid item xs={6} sm={4} md={3} key={foto.id_tanque_foto}>
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: 2,
                    overflow: "hidden",
                    boxShadow: 2,
                  }}
                >
                  <Box
                    component="img"
                    src={foto.foto_url}
                    sx={{
                      width: "100%",
                      height: 140,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  {/* Botón de Borrado estricto (Solo Admin) */}
                  {userRole === "admin" && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteFoto(foto.id_tanque_foto)}
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(255,255,255,0.8)",
                        "&:hover": { bgcolor: "white" },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography
            color="text.secondary"
            sx={{ fontStyle: "italic", textAlign: "center" }}
          >
            Aún no se han subido fotografías para este tanque.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={uploading}>
          Cerrar Galería
        </Button>
      </DialogActions>
    </Dialog>
  );
}
