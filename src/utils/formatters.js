// Formata valor monetário R$ 10,50
export const formatarValor = (valor) => {
  if (!valor && valor !== 0) return '0,00';
  
  const numero = typeof valor === 'string' ? 
    parseFloat(valor.replace(',', '.')) : 
    Number(valor);
  
  return isNaN(numero) ? '0,00' : numero.toFixed(2).replace('.', ',');
};

// Formata data: 25/12/2023
export const formatarData = (data) => {
  if (!data) return 'Data inválida';
  
  try {
    const dataObj = new Date(data);
    return dataObj.toLocaleDateString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

// Formata data e hora: 25/12/2023 14:30
export const formatarDataHora = (data) => {
  if (!data) return 'Data/hora inválida';
  
  try {
    const dataObj = new Date(data);
    return dataObj.toLocaleString('pt-BR');
  } catch (error) {
    console.error('Erro ao formatar data/hora:', error);
    return 'Data/hora inválida';
  }
};

// Formata data extenso: 25 de Dezembro de 2023
export const formatarDataExtenso = (data) => {
  if (!data) return 'Data inválida';
  
  try {
    const dataObj = new Date(data);
    const options = { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    };
    return dataObj.toLocaleDateString('pt-BR', options);
  } catch (error) {
    console.error('Erro ao formatar data extenso:', error);
    return 'Data inválida';
  }
};

// Formata hora: 14:30
export const formatarHora = (data) => {
  if (!data) return 'Hora inválida';
  
  try {
    const dataObj = new Date(data);
    return dataObj.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (error) {
    console.error('Erro ao formatar hora:', error);
    return 'Hora inválida';
  }
};

// Função para formatar valor em BRL
export const formatCurrency = (value) => {
  if (!value) return '';
  
  const numericValue = parseInt(value.replace(/[\D]/g, ''), 10);
  if (isNaN(numericValue)) return '';
  
  return (numericValue / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
