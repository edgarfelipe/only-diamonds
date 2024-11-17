// Update the file upload handling in ModelProfile.tsx
const handleFileUpload = async (files: FileList, type: 'photo' | 'video') => {
  if (!files.length || !user?.id) return;

  const maxFiles = type === 'photo' ? 20 : 3;
  const maxSize = type === 'photo' ? 5 * 1024 * 1024 : 100 * 1024 * 1024;
  const existingFiles = type === 'photo' ? user?.fotos?.length || 0 : user?.videos?.length || 0;
  
  if (files.length + existingFiles > maxFiles) {
    toast.error(`Máximo de ${maxFiles} ${type === 'photo' ? 'fotos' : 'vídeos'} permitido`);
    return;
  }

  setIsUploading(true);
  try {
    const newFiles = [];
    for (const file of Array.from(files)) {
      if (file.size > maxSize) {
        throw new Error(`Arquivo muito grande. Tamanho máximo: ${maxSize / (1024 * 1024)}MB`);
      }

      const filePath = await uploadFile('only-diamonds', user.id, file, type);
      newFiles.push(filePath);
    }

    const updateField = type === 'photo' ? 'fotos' : 'videos';
    const existingMediaFiles = user[updateField] || [];
    const updatedFiles = [...existingMediaFiles, ...newFiles];

    await updateUserFiles(user.id, updateField, updatedFiles);

    updateUser({
      ...user,
      [updateField]: updatedFiles
    });

    toast.success(`${type === 'photo' ? 'Fotos' : 'Vídeos'} adicionados com sucesso!`);
  } catch (error: any) {
    console.error('Error uploading files:', error);
    toast.error(error.message || `Erro ao adicionar ${type === 'photo' ? 'fotos' : 'vídeos'}`);
  } finally {
    setIsUploading(false);
  }
};

const handleDeleteFile = async (path: string, type: 'photo' | 'video') => {
  if (!user?.id) return;

  try {
    await deleteFile('only-diamonds', path);

    const updateField = type === 'photo' ? 'fotos' : 'videos';
    const updatedFiles = user[updateField]?.filter((f: string) => f !== path) || [];

    await updateUserFiles(user.id, updateField, updatedFiles);

    updateUser({
      ...user,
      [updateField]: updatedFiles
    });

    toast.success(`${type === 'photo' ? 'Foto' : 'Vídeo'} removido com sucesso!`);
  } catch (error) {
    console.error('Error deleting file:', error);
    toast.error(`Erro ao remover ${type === 'photo' ? 'foto' : 'vídeo'}`);
  }
};