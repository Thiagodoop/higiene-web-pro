export interface AgenteCompleto {
  id: string;
  name: string;
  cas: string;
  typeDefault: "quant" | "qual";
  anexoNR15: string;
  grau: string;
  lt_ppm: number | null;
  unidade: string;
  dec3048: string;
  anosAposentadoria: string;
  linach: string;
  esocial: string;
  legalText: string;
}

export const CATALAGO_QUIMICOS_COMPLETO: Record<string, AgenteCompleto> = {
  benzeno: {
    id: "benzeno",
    name: "Benzeno",
    cas: "71-43-2",
    typeDefault: "qual",
    anexoNR15: "Anexo 13-A",
    grau: "Grau Máximo (40%)",
    lt_ppm: null,
    unidade: "VRT",
    dec3048: "Anexo IV, Código 1.0.3",
    anosAposentadoria: "25 Anos",
    linach: "Grupo 1 (Carcinogênico para Humanos)",
    esocial: "01.03.001",
    legalText:
      "O Benzeno possui avaliação disciplinada pela Portaria 3.214/78, Anexo 13-A da NR-15, com Valor de Referência Tecnológico (VRT). Previdenciariamente, por constar no Grupo 1 da LINACH com registro CAS, a nocividade é presumida qualitativamente pelo art. 68, § 4º do Dec. 3.048/99 e Súmula 9 da TNU.",
  },
  tolueno: {
    id: "tolueno",
    name: "Tolueno (Metilbenzeno)",
    cas: "108-88-3",
    typeDefault: "quant",
    anexoNR15: "Anexo 11",
    grau: "Grau Médio (20%)",
    lt_ppm: 78.0,
    unidade: "ppm",
    dec3048: "Anexo IV, Código 1.0.19",
    anosAposentadoria: "25 Anos",
    linach: "Não consta no Grupo 1",
    esocial: "01.17.002",
    legalText:
      "Avaliado quantitativamente pelo Anexo 11 da NR-15 com Limite de Tolerância de 78 ppm (290 mg/m³). Enquadramento no Dec. 3.048/99 condicionado à extrapolação do limite ou permanência comprovada.",
  },
  xileno: {
    id: "xileno",
    name: "Xileno - Todos os Isômeros",
    cas: "1330-20-7",
    typeDefault: "quant",
    anexoNR15: "Anexo 11",
    grau: "Grau Médio (20%)",
    lt_ppm: 78.0,
    unidade: "ppm",
    dec3048: "Anexo IV, Código 1.0.19",
    anosAposentadoria: "25 Anos",
    linach: "Não consta no Grupo 1",
    esocial: "01.17.003",
    legalText:
      "Solvente aromático avaliado quantitativamente pelo Anexo 11 da NR-15 com Limite de Tolerância de 78 ppm. Enquadra-se no grupo de hidrocarbonetos do Anexo IV do Dec. 3.048/99.",
  },
  silica: {
    id: "silica",
    name: "Sílica Livre Cristalizada (Quartzo Respirável)",
    cas: "14808-60-7",
    typeDefault: "quant",
    anexoNR15: "Anexo 12",
    grau: "Grau Máximo (40%)",
    lt_ppm: 0.05,
    unidade: "mg/m³",
    dec3048: "Anexo IV, Código 1.0.18",
    anosAposentadoria: "25 Anos",
    linach: "Grupo 1 (Carcinogênico para Humanos)",
    esocial: "01.18.001",
    legalText:
      "A poeira respirável de quartzo é avaliada pelo Anexo 12 da NR-15. Previdenciariamente integra o Grupo 1 da LINACH, gerando tempo especial independentemente da eficácia declarada do EPI.",
  },
  chumbo: {
    id: "chumbo",
    name: "Chumbo e seus Compostos Inorgânicos",
    cas: "7439-92-1",
    typeDefault: "quant",
    anexoNR15: "Anexo 11",
    grau: "Grau Máximo (40%)",
    lt_ppm: 0.1,
    unidade: "mg/m³",
    dec3048: "Anexo IV, Código 1.0.8",
    anosAposentadoria: "25 Anos",
    linach: "Grupo 2B",
    esocial: "01.08.001",
    legalText:
      "Fumos e poeiras de chumbo com LT de 0,1 mg/m³ pelo Anexo 11 da NR-15. Exposição em fundições, fabricação e reforma de baterias e processos de corte a quente.",
  },
  manganes: {
    id: "manganes",
    name: "Manganês e seus Compostos (Fumos/Poeiras)",
    cas: "7439-96-5",
    typeDefault: "quant",
    anexoNR15: "Anexo 12",
    grau: "Grau Máximo (40%)",
    lt_ppm: 1.0,
    unidade: "mg/m³",
    dec3048: "Anexo IV, Código 1.0.14",
    anosAposentadoria: "25 Anos",
    linach: "Não consta no Grupo 1",
    esocial: "01.14.001",
    legalText:
      "Avaliação de fumos em soldagem elétrica (MIG/MAG, eletrodo revestido) com limite regulamentar estipulado no Anexo 12 da NR-15.",
  },
  cromo: {
    id: "cromo",
    name: "Cromo Hexavalente (Cromo VI)",
    cas: "18540-29-9",
    typeDefault: "quant",
    anexoNR15: "Anexo 11",
    grau: "Grau Máximo (40%)",
    lt_ppm: 0.05,
    unidade: "mg/m³",
    dec3048: "Anexo IV, Código 1.0.10",
    anosAposentadoria: "25 Anos",
    linach: "Grupo 1 (Carcinogênico para Humanos)",
    esocial: "01.10.001",
    legalText:
      "Presente em processos de galvanoplastia, cromagem e soldagem de aços inoxidáveis. Enquadramento qualitativo no LTCAT pelo Grupo 1 da LINACH.",
  },
  nhexano: {
    id: "nhexano",
    name: "n-Hexano",
    cas: "110-54-3",
    typeDefault: "quant",
    anexoNR15: "Anexo 11",
    grau: "Grau Médio (20%)",
    lt_ppm: 50.0,
    unidade: "ppm",
    dec3048: "Anexo IV, Código 1.0.19",
    anosAposentadoria: "25 Anos",
    linach: "Não consta no Grupo 1",
    esocial: "01.17.004",
    legalText:
      "Solvente neurotóxico utilizado em indústrias de calçados, colas e extração de óleos vegetais. Limite da NR-15 Anexo 11.",
  },
  oleos_minerais: {
    id: "oleos_minerais",
    name: "Óleos Minerais e Graxas Industriais",
    cas: "8012-95-1",
    typeDefault: "qual",
    anexoNR15: "Anexo 13",
    grau: "Grau Máximo (40%)",
    lt_ppm: null,
    unidade: "Qualitativo",
    dec3048: "Anexo IV, Código 1.0.17",
    anosAposentadoria: "25 Anos",
    linach: "Grupo 1 (Óleos não tratados)",
    esocial: "01.17.005",
    legalText:
      "Manipulação de óleos minerais de corte e usinagem mecânica sem proteção dérmica. Avaliação qualitativa conforme Anexo 13 da NR-15.",
  },
  amianto: {
    id: "amianto",
    name: "Asbestos / Amianto",
    cas: "1332-21-4",
    typeDefault: "quant",
    anexoNR15: "Anexo 12",
    grau: "Grau Máximo (40%)",
    lt_ppm: 2.0,
    unidade: "f/cm³",
    dec3048: "Anexo IV, Código 1.0.2",
    anosAposentadoria: "20 Anos",
    linach: "Grupo 1 (Carcinogênico para Humanos)",
    esocial: "01.02.001",
    legalText:
      "Fibras respiráveis de asbesto. Enquadramento de aposentadoria especial em 20 anos pelo Anexo IV do Decreto 3.048/99.",
  },
  fumos_solda: {
    id: "fumos_solda",
    name: "Fumos Metálicos de Soldagem (Totais)",
    cas: "Mistura",
    typeDefault: "quant",
    anexoNR15: "Anexo 11",
    grau: "Grau Médio (20%)",
    lt_ppm: 5.0,
    unidade: "mg/m³",
    dec3048: "Anexo IV, Código 1.0.19",
    anosAposentadoria: "25 Anos",
    linach: "Grupo 1 (Fumos de Solda IARC)",
    esocial: "01.19.020",
    legalText:
      "Particulados gerados por fusão e arco elétrico. Avaliação quantitativa por gravimetria e qualitativa pelos metais associados.",
  },
  formol: {
    id: "formol",
    name: "Formaldeído (Formol)",
    cas: "50-00-0",
    typeDefault: "quant",
    anexoNR15: "Anexo 11",
    grau: "Grau Máximo (40%)",
    lt_ppm: 1.6,
    unidade: "ppm",
    dec3048: "Anexo IV, Código 1.0.19",
    anosAposentadoria: "25 Anos",
    linach: "Grupo 1 (Carcinogênico para Humanos)",
    esocial: "01.19.070",
    legalText:
      "Agente com valor teto e comprovadamente carcinogênico para vias aéreas superiores, enquadrado no Grupo 1 da LINACH.",
  },
};