export interface ItemTabela24 {
  codigo: string;
  grupo: "Químico" | "Físico" | "Biológico" | "Associação" | "Especial";
  descricao: string;
  detalhes?: string;
  limitePadraoMgM3?: number;
  unidade?: string;
  casNumber?: string;
}

export const TABELA_24_ESOCIAL: ItemTabela24[] = [
  // --- GRUPO 01: AGENTES QUÍMICOS E SUBSTÂNCIAS ---
  { codigo: "01.01.001", grupo: "Químico", descricao: "Arsênio e seus compostos", detalhes: "Vapores e poeiras inorgânicas de arsênio", limitePadraoMgM3: 0.01, unidade: "mg/m3", casNumber: "7440-38-2" },
  { codigo: "01.02.001", grupo: "Químico", descricao: "Asbestos (Amianto)", detalhes: "Fibras respiráveis de crisotila/asbesto", limitePadraoMgM3: 2.0, unidade: "f/cm3", casNumber: "1332-21-4" },
  { codigo: "01.03.001", grupo: "Químico", descricao: "Benzeno e seus compostos", detalhes: "Hidrocarboneto aromático cancerígeno (VPP)", limitePadraoMgM3: 2.5, unidade: "ppm", casNumber: "71-43-2" },
  { codigo: "01.03.002", grupo: "Químico", descricao: "Estireno (Vinilbenzeno)", detalhes: "Monômero utilizado na produção de resinas e plásticos", limitePadraoMgM3: 328, unidade: "mg/m3", casNumber: "100-42-5" },
  { codigo: "01.04.001", grupo: "Químico", descricao: "Berílio e seus compostos", detalhes: "Poeiras e fumos tóxicos de berílio", limitePadraoMgM3: 0.002, unidade: "mg/m3", casNumber: "7440-41-7" },
  { codigo: "01.05.001", grupo: "Químico", descricao: "Bromo e seus compostos", detalhes: "Vapores irritantes de bromo", limitePadraoMgM3: 0.7, unidade: "mg/m3", casNumber: "7726-95-6" },
  { codigo: "01.06.001", grupo: "Químico", descricao: "Cádmio e seus compostos", detalhes: "Fumos e poeiras de cádmio (processos de fusão e corte)", limitePadraoMgM3: 0.01, unidade: "mg/m3", casNumber: "7440-43-9" },
  { codigo: "01.07.001", grupo: "Químico", descricao: "Carvão mineral e seus derivados", detalhes: "Poeira de carvão com sílica associada", limitePadraoMgM3: 2.0, unidade: "mg/m3", casNumber: "N/A" },
  { codigo: "01.08.001", grupo: "Químico", descricao: "Chumbo e compostos inorgânicos", detalhes: "Fumos metálicos e óxidos de chumbo (baterias, fusão)", limitePadraoMgM3: 0.1, unidade: "mg/m3", casNumber: "7439-92-1" },
  { codigo: "01.09.001", grupo: "Químico", descricao: "Cloro e compostos tóxicos", detalhes: "Gás cloro livre em processos de alvejamento e água", limitePadraoMgM3: 2.3, unidade: "mg/m3", casNumber: "7782-50-5" },
  { codigo: "01.09.002", grupo: "Químico", descricao: "Metileno-ortocloroanilina (MOCA)", detalhes: "Agente de cura em poliuretanos", limitePadraoMgM3: 0.11, unidade: "mg/m3", casNumber: "101-14-4" },
  { codigo: "01.10.001", grupo: "Químico", descricao: "Cromo VI e compostos hexavalentes", detalhes: "Poeiras e névoas de cromagem e soldagem inox", limitePadraoMgM3: 0.05, unidade: "mg/m3", casNumber: "18540-29-9" },
  { codigo: "01.11.001", grupo: "Químico", descricao: "Dissulfeto de carbono", detalhes: "Solvente e reagente químico", limitePadraoMgM3: 31, unidade: "mg/m3", casNumber: "75-15-0" },
  { codigo: "01.12.001", grupo: "Químico", descricao: "Fósforo branco e compostos tóxicos", detalhes: "Vapores e névoas fosforadas", limitePadraoMgM3: 0.1, unidade: "mg/m3", casNumber: "7723-14-0" },
  { codigo: "01.14.001", grupo: "Químico", descricao: "Manganês e seus compostos", detalhes: "Fumos de manganês (soldagem eletrodo/MIG/MAG)", limitePadraoMgM3: 1.0, unidade: "mg/m3", casNumber: "7439-96-5" },
  { codigo: "01.15.001", grupo: "Químico", descricao: "Mercúrio metálico e vapores", detalhes: "Vapores de mercúrio e amálgamas", limitePadraoMgM3: 0.04, unidade: "mg/m3", casNumber: "7439-97-6" },
  { codigo: "01.16.001", grupo: "Químico", descricao: "Níquel e compostos inorgânicos", detalhes: "Fumos e pós insolúveis de níquel", limitePadraoMgM3: 1.0, unidade: "mg/m3", casNumber: "7440-02-0" },
  { codigo: "01.17.001", grupo: "Químico", descricao: "Hidrocarbonetos e Derivados de Petróleo", detalhes: "Fração alifática e naftênica em combustíveis", limitePadraoMgM3: 200, unidade: "mg/m3", casNumber: "Mistura" },
  { codigo: "01.17.002", grupo: "Químico", descricao: "Tolueno (Metilbenzeno)", detalhes: "Solvente de tintas, colas, thinner e vernizes", limitePadraoMgM3: 290, unidade: "mg/m3", casNumber: "108-88-3" },
  { codigo: "01.17.003", grupo: "Químico", descricao: "Xileno (Dimetilbenzeno - Isômeros)", detalhes: "Solvente para desengraxe, pintura e formulações", limitePadraoMgM3: 340, unidade: "mg/m3", casNumber: "1330-20-7" },
  { codigo: "01.17.004", grupo: "Químico", descricao: "n-Hexano", detalhes: "Solvente para extração de óleos vegetais e colas", limitePadraoMgM3: 180, unidade: "mg/m3", casNumber: "110-54-3" },
  { codigo: "01.17.005", grupo: "Químico", descricao: "Óleos Minerais e Graxas Industriais", detalhes: "Névoas de óleos de corte e usinagem mecânica", limitePadraoMgM3: 5.0, unidade: "mg/m3", casNumber: "8012-95-1" },
  { codigo: "01.18.001", grupo: "Químico", descricao: "Sílica Livre Cristalina (Quartzo Respirável)", detalhes: "Fração respirável em construção civil, pedreiras e fundição", limitePadraoMgM3: 0.05, unidade: "mg/m3", casNumber: "14808-60-7" },
  { codigo: "01.19.002", grupo: "Químico", descricao: "Acrilonitrila", detalhes: "Monômero de fibras sintéticas e plásticos acrílicos", limitePadraoMgM3: 4.3, unidade: "mg/m3", casNumber: "107-13-1" },
  { codigo: "01.19.020", grupo: "Químico", descricao: "Fumos Metálicos Totais (Solda / Oxicorte)", detalhes: "Névoas sólidas respiráveis de óxidos de ferro, zinco e cobre", limitePadraoMgM3: 5.0, unidade: "mg/m3", casNumber: "Mistura" },
  { codigo: "01.19.025", grupo: "Químico", descricao: "Acetona (Propanona)", detalhes: "Solvente volátil de limpeza de peças e laboratórios", limitePadraoMgM3: 1870, unidade: "mg/m3", casNumber: "67-64-1" },
  { codigo: "01.19.030", grupo: "Químico", descricao: "Álcool Etílico (Etanol)", detalhes: "Solvente e desinfetante industrial", limitePadraoMgM3: 1480, unidade: "mg/m3", casNumber: "64-17-5" },
  { codigo: "01.19.035", grupo: "Químico", descricao: "Álcool Isopropílico (Isopropanol)", detalhes: "Limpeza de placas eletrônicas e óptica", limitePadraoMgM3: 780, unidade: "mg/m3", casNumber: "67-63-0" },
  { codigo: "01.19.040", grupo: "Químico", descricao: "Ácido Sulfúrico (Névoa)", detalhes: "Névoas ácidas corrosivas em baterias e decapagem", limitePadraoMgM3: 0.2, unidade: "mg/m3", casNumber: "7664-93-9" },
  { codigo: "01.19.050", grupo: "Químico", descricao: "Ácido Clorídrico / Cloreto de Hidrogênio", detalhes: "Gás e vapores de decapagem metálica", limitePadraoMgM3: 5.5, unidade: "mg/m3", casNumber: "7647-01-0" },
  { codigo: "01.19.055", grupo: "Químico", descricao: "Ácido Nítrico", detalhes: "Vapores nitrosos e névoas ácidas", limitePadraoMgM3: 5.0, unidade: "mg/m3", casNumber: "7697-37-2" },
  { codigo: "01.19.060", grupo: "Químico", descricao: "Poeira Incômoda / Poeira Total", detalhes: "Particulado sólido não tóxico em suspensão", limitePadraoMgM3: 10.0, unidade: "mg/m3", casNumber: "N/A" },
  { codigo: "01.19.065", grupo: "Químico", descricao: "Poeira Respirável", detalhes: "Fração que penetra além dos bronquíolos terminais", limitePadraoMgM3: 3.0, unidade: "mg/m3", casNumber: "N/A" },
  { codigo: "01.19.070", grupo: "Químico", descricao: "Formaldeído (Formol)", detalhes: "Preservante, resinas e colas fenólicas (Cancerígeno)", limitePadraoMgM3: 1.6, unidade: "mg/m3", casNumber: "50-00-0" },
  { codigo: "01.19.080", grupo: "Químico", descricao: "Monóxido de Carbono (CO)", detalhes: "Gás asfixiante de combustão em empilhadeiras e fornos", limitePadraoMgM3: 39, unidade: "mg/m3", casNumber: "630-08-0" },

  // --- GRUPO 02: AGENTES FÍSICOS ---
  { codigo: "02.01.001", grupo: "Físico", descricao: "Ruído contínuo ou intermitente", unidade: "dB(A)" },
  { codigo: "02.01.002", grupo: "Físico", descricao: "Vibrações localizadas (Mãos e Braços - VMB)", unidade: "m/s2" },
  { codigo: "02.01.003", grupo: "Físico", descricao: "Vibração de corpo inteiro (Aceleração normalizada - aren)", unidade: "m/s2" },
  { codigo: "02.01.004", grupo: "Físico", descricao: "Vibração de corpo inteiro (Dose resultante - VDVR)", unidade: "m/s1.75" },
  { codigo: "02.01.006", grupo: "Físico", descricao: "Radiações ionizantes", unidade: "mSv" },
  { codigo: "02.01.014", grupo: "Físico", descricao: "Temperaturas anormais (Calor acima do L.T. - IBUTG)", unidade: "°C" },

  // --- GRUPO 03: AGENTES BIOLÓGICOS ---
  { codigo: "03.01.001", grupo: "Biológico", descricao: "Contato com pacientes ou materiais infectocontagiosos", unidade: "Qualitativo" },
  { codigo: "03.01.005", grupo: "Biológico", descricao: "Trabalhos em galerias, fossas e tanques de esgoto", unidade: "Qualitativo" },
  { codigo: "03.01.007", grupo: "Biológico", descricao: "Coleta e industrialização de lixo urbano", unidade: "Qualitativo" },

  // --- OUTROS E AUSÊNCIA ---
  { codigo: "05.01.001", grupo: "Especial", descricao: "Outros agentes nocivos (Decisão judicial)", unidade: "Variável" },
  { codigo: "09.01.001", grupo: "Especial", descricao: "Ausência de agente nocivo ou de atividades especiais", unidade: "N/A" }
];