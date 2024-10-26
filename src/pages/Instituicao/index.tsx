import { forwardRef, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import axios from "axios";

// Material UI imports
import {
  Box,
  Button,
  Container,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  IconButton,
  InputLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid2"; // Grid v2
import { styled } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { LayoutDashboard } from "../../components/LayoutDashboard";
import { Loading } from "../../components/Loading";
import { SnackbarMui } from "../../components/Snackbar";
import { verificaTokenExpirado } from "../../services/token";
import { ConfirmationDialog } from "../../components/Dialog";
import React from "react";

// Interface para redes sociais
interface ISocialMedia {
  id: number;
  tipo: string;
  nome: string;
  url: string;
  isNew?: boolean;
}

interface IContato {
  id: number;
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
}

interface IEndereco {
  id: number;
  local: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  isNew?: boolean;
}

interface IFormData {
  contato: IContato;
  socials: ISocialMedia[];
}

// Componentes estilizados mantidos como estavam...
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
}));

const FormTextField = styled(TextField)({
  marginBottom: '1rem',
});



const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export default function Instituicao() {
  const [loading, setLoading] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error" | "info" | "warning">("info");
  const navigate = useNavigate();
  // Estados para o Dialog
  const [dialogState, setDialogState] = useState({
    open: false,
    id: null as number | null
  });

  const {
    control: contatoControl,
    handleSubmit: handleContatoSubmit,
    setValue: setContatoValue,
    formState: { errors: contatoErrors },
  } = useForm<IContato>({
    defaultValues: {
      id: 0,
      nome: "",
      cnpj: "",
      email: "",
      telefone: "",
    }
  });

  const {
    control: socialsControl,
    handleSubmit: handleSocialsSubmit,
    setValue: setSocialsValue,
    getValues: watchSocials,
    formState: { errors: socialsErros },
  } = useForm<{ socials: ISocialMedia[] }>({
    defaultValues: {
      socials: []
    }
  });

  const {
    control: locaisControl,
    handleSubmit: handleLocaisSubmit,
    setValue: setLocaisValue,
    getValues: watchLocais,
    formState: { errors: locaisErrors },
  } = useForm<{ locais: IEndereco[] }>({
    defaultValues: {
      locais: [{
        id: 0,
        local: "",
        logradouro: "",
        numero: "",
        complemento: "", 
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
        isNew: true
      }]
    }
  });

  const locais = watchLocais("locais");
  const socials = watchSocials("socials");

  useEffect(() => {
    if (localStorage.length === 0 || verificaTokenExpirado()) {
      navigate("/");
    }

    setLoading(true);

    // Fetch instituição data
    axios.get(import.meta.env.VITE_URL + '/instituicoes')
      .then((res) => {
        const instituicaoData = res.data[0];
        setContatoValue("nome", instituicaoData.nome || '');
        setContatoValue("cnpj", instituicaoData.cnpj || '');
        setContatoValue("email", instituicaoData.email || '');
        setContatoValue("telefone", instituicaoData.telefone || '');
      })
      .catch(() => {
        handleShowSnackbar("Erro ao carregar dados da instituição", "error");
      })
      .finally(() => setLoading(false));

    // Fetch Endereços
    axios.get(import.meta.env.VITE_URL + '/enderecos')
      .then((res) => {
        setLocaisValue("locais", res.data);
      }).catch(() => {
        handleShowSnackbar("Erro ao carregar endereços", "error");
      })
      .finally(() => setLoading(false));

    // Fetch social media data
    axios.get(import.meta.env.VITE_URL + '/redes-sociais')
      .then((res) => {
        setSocialsValue("socials", res.data);
      })
      .catch(() => {
        handleShowSnackbar("Erro ao carregar redes sociais", "error");
      })
      .finally(() => setLoading(false));


  }, [navigate, setContatoValue, setSocialsValue, setLocaisValue]);


  const handleShowSnackbar = useCallback((
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  ) => {
    setSnackbarVisible(true);
    setMessage(message);
    setSeverity(severity);
  }, [setSnackbarVisible, setMessage, setSeverity]);

  const addSocial = useCallback(() => {
    const currentSocials = watchSocials("socials") || [];
    const newSocial: ISocialMedia = {
      id: currentSocials.length + 1,
      tipo: "",
      nome: "",
      url: "",
      isNew: true,  // Marcar como nova
    };
    setSocialsValue("socials", [...currentSocials, newSocial]);
  }, [watchSocials, setSocialsValue]);

  const removeLocal = useCallback((id: number) => {
    const currentLocais = watchLocais("locais") || [];
    setLocaisValue(
      "locais",
      currentLocais.filter((local) => local.id !== id)
    );
  }, [watchLocais, setLocaisValue]);

  const addLocal = useCallback(() => {
    const currentLocais = watchLocais("locais") || [];
    const newLocal: IEndereco = {
      id: currentLocais.length + 1,
      local: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      estado: "",
      cep: "",
      isNew: true
    };
    setLocaisValue("locais", [...currentLocais, newLocal]);
  }, [watchLocais, setLocaisValue]);

  const removeSocial = useCallback((id: number) => {
    // Abre o dialog e guarda o ID para usar depois
    setDialogState({
      open: true,
      id: id
    });
  }, []);


  const SocialMediaCard = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(2),
    position: 'relative',
  }));

  const DeleteButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
  }));

  // Função que realmente faz a remoção
  const handleConfirmedDeleteSocial = useCallback(() => {
    const id = dialogState.id;
    if (id === null) return;

    const currentSocials = watchSocials("socials") || [];
    const socialToRemove = currentSocials.find((social) => social.id === id);

    if (socialToRemove && !socialToRemove.isNew) {
      setLoading(true);
      axios.delete(import.meta.env.VITE_URL + `/redes-sociais/${id}`)
        .then(() => {
          setSocialsValue(
            "socials",
            currentSocials.filter((social) => social.id !== id)
          );
          handleShowSnackbar("Rede social removida com sucesso", "success");
        })
        .catch((error) => {
          const errorMessage = error.response?.data || "Erro ao remover rede social";
          handleShowSnackbar(errorMessage, "error");
        })
        .finally(() => setLoading(false));
    } else {
      setSocialsValue(
        "socials",
        currentSocials.filter((social) => social.id !== id)
      );
    }
  }, [dialogState.id, watchSocials, setSocialsValue, setLoading]);

  const handleConfirmedDeleteLocal = useCallback(() => {
    const id = dialogState.id;
    if (id === null) return;

    const currentLocais = watchLocais("locais") || [];
    const localToRemove = currentLocais.find((local) => local.id === id);

    if (localToRemove && !localToRemove.isNew) {
      setLoading(true);
      axios.delete(import.meta.env.VITE_URL + `/enderecos/${id}`)
        .then(() => {
          setLocaisValue("locais", currentLocais.filter((local) => local.id !== id));
          handleShowSnackbar("Endereço removido com sucesso", "success");
        })
        .catch((error) => handleShowSnackbar(error.response?.data || "Erro ao remover endereço", "error"))
        .finally(() => setLoading(false));
    } else {
      setLocaisValue("locais", currentLocais.filter((local) => local.id !== id));
    }
  }, [dialogState.id, watchLocais, setLocaisValue, handleShowSnackbar, setLoading]);

  const submitContato: SubmitHandler<IContato> = useCallback((data) => {
    setLoading(true);
    axios.put(import.meta.env.VITE_URL + `/instituicoes`, data)
      .then(() => {
        handleShowSnackbar("Informações da instituição editadas com sucesso", "success");
      })
      .catch((error) => handleShowSnackbar(error.response.data, 'error'))
      .finally(() => setLoading(false));
  }, [handleShowSnackbar]);

  const submitSocials: SubmitHandler<{ socials: ISocialMedia[] }> = useCallback(async (data) => {
    setLoading(true);

    const newSocials = data.socials
      .filter(social => social.isNew)  // Filtra apenas as redes sociais novas
      .map(({ id, isNew, ...rest }) => rest); // Remove os campos 'id' e 'isNew' dos novos itens

    const existingSocials = data.socials
      .filter(social => !social.isNew) // Filtra as redes sociais já existentes
      .map(({ isNew, ...rest }) => rest); // Remove o campo 'isNew' das existentes

    try {
      if (newSocials.length > 0) {
        await Promise.all(newSocials.map(social =>
          axios.post(import.meta.env.VITE_URL + `/redes-sociais`, social)
        ));
      }
      if (existingSocials.length > 0) {
        await Promise.all(existingSocials.map(social =>
          axios.put(import.meta.env.VITE_URL + `/redes-sociais/${social.id}`, social)
        ));
      }

      handleShowSnackbar("Redes sociais atualizadas com sucesso", "success");

    } catch (error: any) {
      const errorMessage = error.response?.data || "Erro ao atualizar redes sociais";
      handleShowSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }

  }, [handleShowSnackbar]);

  const submitLocais = useCallback(async (data: { locais: IEndereco[] }) => {
    setLoading(true);

    const newLocais = data.locais
      .filter(local => local.isNew)  // Filtra apenas os novos
      .map(({ id, isNew, ...rest }) => rest); // Remove os campos 'id' e 'isNew'

    const existingLocais = data.locais
      .filter(local => !local.isNew) // Filtra os já existentes
      .map(({ isNew, ...rest }) => rest); // Remove o campo 'isNew'

    try {
      if (newLocais.length > 0) {
        await Promise.all(newLocais.map(local =>
          axios.post(import.meta.env.VITE_URL + `/enderecos`, local)
        ));
      }

      if (existingLocais.length > 0) {
        await Promise.all(existingLocais.map(local =>
          axios.put(import.meta.env.VITE_URL + `/enderecos/${local.id}`, local)
        ));
      }

      handleShowSnackbar("Endereços atualizados com sucesso", "success");
    } catch (error: any) {
      handleShowSnackbar(error.response?.data || "Erro ao salvar endereços", "error");
    } finally {
      setLoading(false);
    }
  }, [handleShowSnackbar, setLoading]);

  const onCepBlur = useCallback(async (cep: string, id: number) => {
    if (cep.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        const { logradouro, complemento, bairro, localidade, uf } = response.data;

        // Preenche os campos automaticamente
        setLocaisValue(`locais.${id}.logradouro`, logradouro);
        setLocaisValue(`locais.${id}.complemento`, complemento);
        setLocaisValue(`locais.${id}.bairro`, bairro);
        setLocaisValue(`locais.${id}.cidade`, localidade);
        setLocaisValue(`locais.${id}.estado`, uf);
        setLocaisValue(`locais.${id}.cep`, cep);
      } catch (error) {
        console.error("Erro ao buscar o CEP:", error);
        // Você pode adicionar um tratamento de erro aqui se desejar
      }
    }
  }, [setLocaisValue]);

  return (
    <>
      <Loading visible={loading} />
      <LayoutDashboard>
        <SnackbarMui
          open={snackbarVisible}
          message={message}
          severity={severity}
          onClose={() => setSnackbarVisible(false)}
          position={{
            vertical: "top",
            horizontal: "center",
          }}
        />

        <Container maxWidth="md">
          <StyledPaper elevation={3}>
            <Typography variant="h4" gutterBottom sx={{ textAlign: "center" }}>
              Instituição - Casa da Paz
            </Typography>

            <Box component="form" onSubmit={handleContatoSubmit(submitContato)} noValidate>

              <Controller
                name="nome"
                control={contatoControl}
                rules={{
                  required: "O nome da instituição é obrigatório",
                  pattern: {
                    value: nameRegex,
                    message: 'O nome não pode conter números'
                  }
                }}
                render={({ field }) => (
                  <FormTextField
                    {...field}
                    fullWidth
                    label="Nome"
                    error={!!contatoErrors.nome}
                    helperText={contatoErrors.nome?.message}
                  />
                )}
              />

              <Controller
                name="cnpj"
                control={contatoControl}
                rules={{ required: "O CNPJ da instituição é obrigatório" }}
                render={({ field }) => (
                  <FormTextField
                    {...field}
                    fullWidth
                    label="CNPJ"
                    error={!!contatoErrors.cnpj}
                    helperText={contatoErrors.cnpj?.message}
                  />
                )}
              />

              <Controller
                name="email"
                control={contatoControl}
                rules={{
                  required: "O email da instituição é obrigatório",
                  pattern: {
                    value: emailRegex,
                    message: 'Email inválido'
                  }
                }}
                render={({ field }) => (
                  <FormTextField
                    {...field}
                    fullWidth
                    label="Email"
                    error={!!contatoErrors.email}
                    helperText={contatoErrors.email?.message}
                  />
                )}
              />

              <Controller
                name="telefone"
                control={contatoControl}
                rules={{ required: "O telefone da instituição é obrigatório" }}
                render={({ field }) => (
                  <FormTextField
                    {...field}
                    fullWidth
                    label="Telefone"
                    error={!!contatoErrors.telefone}
                    helperText={contatoErrors.telefone?.message}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
              >
                Salvar Informações
              </Button>

            </Box>
          </StyledPaper> {/*IContato*/}

          <StyledPaper elevation={3}>
            <ConfirmationDialog
              open={dialogState.open}
              title="Confirmar exclusão"
              message="Tem certeza que deseja excluir esta rede social?"
              onConfirm={handleConfirmedDeleteSocial}
              onClose={() => setDialogState({ open: false, id: null })}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5">Endereços</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addLocal}
                size="small"
              >
                Adicionar
              </Button>
            </Box>

            <Box component="form" onSubmit={handleLocaisSubmit(submitLocais)} noValidate>
              {locais?.map((local, index) => (
                <SocialMediaCard key={local.id} sx={{ p: 1.5 }}>
                  <Typography variant="body1" sx={{ mb: 1.5, pl: 0.5 }}>
                    <strong>{local.isNew ? "Novo" : "ID: " + local.id}</strong>
                    <DeleteButton
                      color="error"
                      onClick={() => removeLocal(local.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </DeleteButton>

                  </Typography>


                  <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 4, md: 12 }} >
                    <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                      <Controller
                        name={`locais.${index}.local`}
                        control={locaisControl}
                        rules={{ required: "O nome do local é obrigatório" }}
                        render={({ field }) => (
                          <FormTextField
                            {...field}
                            fullWidth
                            sx={{ mb: 0 }}
                            size="small"
                            label="Nome do Local"
                            placeholder="Ex: Sede, Bazar"
                            error={!!locaisErrors.locais?.[index]?.local}
                            helperText={locaisErrors?.locais?.[index]?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                      <Controller
                        name={`locais.${index}.cep`}
                        control={locaisControl}
                        rules={{ required: "O CEP é obrigatório" }}
                        render={({ field }) => (
                          <FormTextField
                            {...field}
                            onBlur={() => onCepBlur(field.value, index)}
                            fullWidth
                            sx={{ mb: 0 }}
                            size="small"
                            label="CEP"
                            placeholder="00000-000"
                            error={!!locaisErrors.locais?.[index]?.cep}
                            helperText={locaisErrors?.locais?.[index]?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                      <Controller
                        name={`locais.${index}.logradouro`}
                        control={locaisControl}
                        rules={{ required: "O Lograduro é obrigatório" }}
                        render={({ field }) => (
                          <FormTextField
                            {...field}
                            fullWidth
                            sx={{ mb: 0 }}
                            size="small"
                            label="Logradouro"
                            placeholder="Rua, Av. ou outros"
                            error={!!locaisErrors.locais?.[index]?.logradouro}
                            helperText={locaisErrors?.locais?.[index]?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                      <Controller
                        name={`locais.${index}.numero`}
                        control={locaisControl}
                        rules={{ required: "O número é obrigatório" }}
                        render={({ field }) => (
                          <FormTextField
                            {...field}
                            fullWidth
                            sx={{ mb: 0 }}
                            size="small"
                            label="Nº"
                            placeholder="Ex: 123 ou 0 em caso de sem nº"
                            error={!!locaisErrors.locais?.[index]?.numero}
                            helperText={locaisErrors?.locais?.[index]?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                      <Controller
                        name={`locais.${index}.complemento`}
                        control={locaisControl}
                        rules={{ required: "O complemento é obrigatório" }}
                        render={({ field }) => (
                          <FormTextField
                            {...field}
                            fullWidth
                            sx={{ mb: 0 }}
                            size="small"
                            label="Complemento"
                            placeholder="Ex: Casa, Prédio Comercial"
                            error={!!locaisErrors.locais?.[index]?.complemento}
                            helperText={locaisErrors?.locais?.[index]?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                      <Controller
                        name={`locais.${index}.bairro`}
                        control={locaisControl}
                        rules={{ required: "O bairro é obrigatório" }}
                        render={({ field }) => (
                          <FormTextField
                            {...field}
                            fullWidth
                            sx={{ mb: 0 }}
                            size="small"
                            label="Bairro"
                            placeholder="Nome do bairro"
                            error={!!locaisErrors.locais?.[index]?.bairro}
                            helperText={locaisErrors?.locais?.[index]?.message}
                          />
                        )}
                      />
                    </Grid>


                    <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                      <Controller
                        name={`locais.${index}.cidade`}
                        control={locaisControl}
                        rules={{ required: "A cidade é obrigatório" }}
                        render={({ field }) => (
                          <FormTextField
                            {...field}
                            fullWidth
                            sx={{ mb: 0 }}
                            size="small"
                            label="Cidade"
                            placeholder="Cidade"
                            error={!!locaisErrors.locais?.[index]?.cidade}
                            helperText={locaisErrors?.locais?.[index]?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                      <Controller
                        name={`locais.${index}.estado`}
                        control={locaisControl}
                        rules={{ required: "O Estado é obrigatório" }}
                        render={({ field }) => (
                          <FormTextField
                            {...field}
                            fullWidth
                            sx={{ mb: 0 }}
                            size="small"
                            label="Estado"
                            placeholder="UF Ex: SP"
                            error={!!locaisErrors.locais?.[index]?.estado}
                            helperText={locaisErrors?.locais?.[index]?.message}
                          />
                        )}
                      />
                    </Grid>

                  </Grid>
                </SocialMediaCard>
              ))}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                sx={{ mt: 2 }}
              >
                Salvar Endereços
              </Button>
            </Box>
          </StyledPaper>  {/*IEndereco*/}

          <StyledPaper elevation={3}>
            <ConfirmationDialog
              open={dialogState.open}
              title="Confirmar exclusão"
              message="Tem certeza que deseja excluir esta rede social?"
              onConfirm={handleConfirmedDeleteSocial}
              onClose={() => setDialogState({ open: false, id: null })}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h5">Redes Sociais</Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addSocial}
                size="small"
              >
                Adicionar
              </Button>
            </Box>

            <form onSubmit={handleSocialsSubmit(submitSocials)}>
              {socials?.map((social, index) => (
                <SocialMediaCard key={social.id} sx={{ p: 1.5 }}>
                  <Typography variant="body1" sx={{ mb: 1.5, pl: 0.5 }}>
                    <strong>{social.isNew ? "Novo" : "ID: " + social.id}</strong>
                    <DeleteButton
                      color="error"
                      onClick={() => removeSocial(social.id)}
                      size="small"
                    >
                      <DeleteIcon />
                    </DeleteButton>

                  </Typography>


                  <Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 12 }} >
                    <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                      <Controller
                        name={`socials.${index}.tipo`}
                        control={socialsControl}
                        rules={{ required: "O tipo é obrigatório" }}
                        render={({ field }) => (
                          <FormControl fullWidth size="small" error={!!socialsErros}>
                            <InputLabel>Rede Social</InputLabel>
                            <Select
                              {...field}

                              label="Rede Social"
                              placeholder="Tipo de Rede Social"
                            >
                              <MenuItem value="">Tipo de Rede Social</MenuItem>
                              <MenuItem value="Instagram">Instagram</MenuItem>
                              <MenuItem value="Fanpage">Facebook</MenuItem>
                              <MenuItem value="Twitter">Twitter</MenuItem>
                              <MenuItem value="LinkedIn">LinkedIn</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      />
                    </Grid>

                    <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                      <Controller
                        name={`socials.${index}.nome`}
                        control={socialsControl}
                        rules={{ required: "O nome é obrigatório" }}
                        render={({ field }) => (
                          <FormTextField
                            {...field}
                            fullWidth
                            sx={{ mb: 0 }}
                            size="small"
                            label="Nome"
                            placeholder="Nome do Perfil"
                            error={!!socialsErros}
                            helperText={socialsErros?.socials?.[index]?.message}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ md: 4, sm: 12, xs: 4 }}>
                      <Controller
                        name={`socials.${index}.url`}
                        control={socialsControl}
                        rules={{ required: "A URL é obrigatória" }}
                        render={({ field }) => (
                          <FormTextField
                            {...field}
                            fullWidth
                            sx={{ mb: 0 }}
                            label="URL ou @"
                            size="small"
                            placeholder="URL ou @"
                            error={!!socialsErros}
                            helperText={socialsErros?.socials?.[index]?.message}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </SocialMediaCard>
              ))}

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                sx={{ mt: 2 }}
              >
                Salvar Redes Sociais
              </Button>
            </form>
          </StyledPaper>  {/*IRedeSociais*/}


        </Container>
      </LayoutDashboard>
    </>
  );
}
