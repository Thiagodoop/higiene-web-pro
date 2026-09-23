export interface ItemTabela24 {
  codigo: string;
  grupo: "Químico" | "Físico" | "Biológico" | "Associação" | "Especial";
  descricao: string;
  limitePadraoMgM3?: number;
  unidade?: string;
}

export const TABELA_24_ESOCIAL: ItemTabela24[] = [
  // --- GRUPO 01: AGENTES QUÍMICOS E SUBSTÂNCIAS ---
  { codigo: "01.01.001", grupo: "Químico", descricao: "Arsênio e seus compostos", limitePadraoMgM3: 0.01, unidade: "mg/m3" },
  { codigo: "01.02.001", grupo: "Químico", descricao: "Asbestos (Amianto)", limitePadraoMgM3: 2.0, unidade: "f/cm3" },
  { codigo: "01.03.001", grupo: "Químico", descricao: "Benzeno e seus compostos tóxicos", limitePadraoMgM3: 2.5, unidade: "ppm" },
  { codigo: "01.03.002", grupo: "Químico", descricao: "Estireno (Vinilbenzeno)", limitePadraoMgM3: 328, unidade: "mg/m3" },
  { codigo: "01.04.001", grupo: "Químico", descricao: "Berílio e seus compostos tóxicos", limitePadraoMgM3: 0.002, unidade: "mg/m3" },
  { codigo: "01.05.001", grupo: "Químico", descricao: "Bromo e seus compostos tóxicos", limitePadraoMgM3: 0.7, unidade: "mg/m3" },
  { codigo: "01.06.001", grupo: "Químico", descricao: "Cádmio e seus compostos tóxicos", limitePadraoMgM3: 0.01, unidade: "mg/m3" },
  { codigo: "01.07.001", grupo: "Químico", descricao: "Carvão mineral e seus derivados", limitePadraoMgM3: 2.0, unidade: "mg/m3" },
  { codigo: "01.08.001", grupo: "Químico", descricao: "Chumbo e seus compostos tóxicos", limitePadraoMgM3: 0.1, unidade: "mg/m3" },
  { codigo: "01.09.001", grupo: "Químico", descricao: "Cloro e seus compostos tóxicos", limitePadraoMgM3: 2.3, unidade: "mg/m3" },
  { codigo: "01.09.002", grupo: "Químico", descricao: "Metileno-ortocloroanilina (MOCA)", limitePadraoMgM3: 0.11, unidade: "mg/m3" },
  { codigo: "01.09.003", grupo: "Químico", descricao: "Bis(clorometil) éter", limitePadraoMgM3: 0.005, unidade: "ppm" },
  { codigo: "01.10.001", grupo: "Químico", descricao: "Cromo e seus compostos tóxicos (Cromo VI)", limitePadraoMgM3: 0.05, unidade: "mg/m3" },
  { codigo: "01.11.001", grupo: "Químico", descricao: "Dissulfeto de carbono", limitePadraoMgM3: 31, unidade: "mg/m3" },
  { codigo: "01.12.001", grupo: "Químico", descricao: "Fósforo e seus compostos tóxicos", limitePadraoMgM3: 0.1, unidade: "mg/m3" },
  { codigo: "01.13.001", grupo: "Químico", descricao: "Iodo", limitePadraoMgM3: 1.0, unidade: "mg/m3" },
  { codigo: "01.14.001", grupo: "Químico", descricao: "Manganês e seus compostos (Fumos/Poeiras)", limitePadraoMgM3: 1.0, unidade: "mg/m3" },
  { codigo: "01.15.001", grupo: "Químico", descricao: "Mercúrio e seus compostos", limitePadraoMgM3: 0.04, unidade: "mg/m3" },
  { codigo: "01.16.001", grupo: "Químico", descricao: "Níquel e seus compostos tóxicos", limitePadraoMgM3: 1.0, unidade: "mg/m3" },
  { codigo: "01.17.001", grupo: "Químico", descricao: "Petróleo, xisto betuminoso, gás natural e derivados", limitePadraoMgM3: 200, unidade: "mg/m3" },
  { codigo: "01.17.002", grupo: "Químico", descricao: "Tolueno (Derivado de Petróleo)", limitePadraoMgM3: 290, unidade: "mg/m3" },
  { codigo: "01.17.003", grupo: "Químico", descricao: "Xileno (Dimetilbenzeno)", limitePadraoMgM3: 340, unidade: "mg/m3" },
  { codigo: "01.17.004", grupo: "Químico", descricao: "Hexano (n-Hexano)", limitePadraoMgM3: 180, unidade: "mg/m3" },
  { codigo: "01.17.005", grupo: "Químico", descricao: "Óleos Minerais e Graxas (Hidrocarbonetos)", limitePadraoMgM3: 5.0, unidade: "mg/m3" },
  { codigo: "01.18.001", grupo: "Químico", descricao: "Sílica livre cristalina (Quartzo respirável)", limitePadraoMgM3: 0.05, unidade: "mg/m3" },
  { codigo: "01.19.001", grupo: "Químico", descricao: "Butadieno-estireno", limitePadraoMgM3: 4.4, unidade: "mg/m3" },
  { codigo: "01.19.002", grupo: "Químico", descricao: "Acrilonitrila", limitePadraoMgM3: 4.3, unidade: "mg/m3" },
  { codigo: "01.19.003", grupo: "Químico", descricao: "1,3-Butadieno", limitePadraoMgM3: 4.4, unidade: "mg/m3" },
  { codigo: "01.19.020", grupo: "Químico", descricao: "Fumos Metálicos de Soldagem", limitePadraoMgM3: 5.0, unidade: "mg/m3" },
  { codigo: "01.19.025", grupo: "Químico", descricao: "Acetona (Propanona)", limitePadraoMgM3: 1870, unidade: "mg/m3" },
  { codigo: "01.19.030", grupo: "Químico", descricao: "Álcool Etílico (Etanol)", limitePadraoMgM3: 1480, unidade: "mg/m3" },
  { codigo: "01.19.040", grupo: "Químico", descricao: "Ácido Sulfúrico (Névoa)", limitePadraoMgM3: 0.2, unidade: "mg/m3" },
  { codigo: "01.19.050", grupo: "Químico", descricao: "Ácido Clorídrico", limitePadraoMgM3: 5.5, unidade: "mg/m3" },
  { codigo: "01.19.060", grupo: "Químico", descricao: "Poeira Incômoda / Poeira Total", limitePadraoMgM3: 10.0, unidade: "mg/m3" },

  // --- GRUPO 02: AGENTES FÍSICOS ---
  { codigo: "02.01.001", grupo: "Físico", descricao: "Ruído contínuo ou intermitente", unidade: "dB(A)" },
  { codigo: "02.01.002", grupo: "Físico", descricao: "Vibrações localizadas (Mãos e Braços - VMB)", unidade: "m/s2" },
  { codigo: "02.01.003", grupo: "Físico", descricao: "Vibração de corpo inteiro (Aceleração normalizada - aren)", unidade: "m/s2" },
  { codigo: "02.01.004", grupo: "Físico", descricao: "Vibração de corpo inteiro (Dose resultante - VDVR)", unidade: "m/s1.75" },
  { codigo: "02.01.005", grupo: "Físico", descricao: "Trabalhos com perfuratrizes e marteletes pneumáticos", unidade: "m/s2" },
  { codigo: "02.01.006", grupo: "Físico", descricao: "Radiações ionizantes", unidade: "mSv" },
  { codigo: "02.01.014", grupo: "Físico", descricao: "Temperaturas anormais (Calor acima do L.T. - IBUTG)", unidade: "°C" },
  { codigo: "02.01.015", grupo: "Físico", descricao: "Pressão atmosférica anormal (Ar comprimido/Hiperbárica)", unidade: "bar" },

  // --- GRUPO 03: AGENTES BIOLÓGICOS ---
  { codigo: "03.01.001", grupo: "Biológico", descricao: "Contato com pacientes ou materiais infectocontagiosos", unidade: "Qualitativo" },
  { codigo: "03.01.002", grupo: "Biológico", descricao: "Trabalhos com animais infectados e preparo de soro/vacina", unidade: "Qualitativo" },
  { codigo: "03.01.005", grupo: "Biológico", descricao: "Trabalhos em galerias, fossas e tanques de esgoto", unidade: "Qualitativo" },
  { codigo: "03.01.007", grupo: "Biológico", descricao: "Coleta e industrialização de lixo urbano", unidade: "Qualitativo" },

  // --- GRUPO 04 e 05: ASSOCIAÇÃO, OUTROS E AUSÊNCIA ---
  { codigo: "04.01.001", grupo: "Associação", descricao: "Mineração subterrânea afastada da frente de produção", unidade: "Qualitativo" },
  { codigo: "04.01.002", grupo: "Associação", descricao: "Mineração subterrânea em frente de produção", unidade: "Qualitativo" },
  { codigo: "05.01.001", grupo: "Especial", descricao: "Outros agentes nocivos (Decisão judicial ou administrativa)", unidade: "Variável" },
  { codigo: "09.01.001", grupo: "Especial", descricao: "Ausência de agente nocivo ou de atividades especiais", unidade: "N/A" }
];