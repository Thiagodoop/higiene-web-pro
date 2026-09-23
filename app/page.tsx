"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { supabase } from "./supabase";
import { CATALAGO_QUIMICOS_COMPLETO, AgenteCompleto } from "./tabela24";

interface AvaliacaoHO {
  id: string;
  created_at?: string;
  data_medicao: string;
  agente: string;
  codigo_esocial: string;
  empresa_nome: string;
  ghe_nome: string;
  funcao: string;
  parametros_campo: string;
  resultado_numerico: string;
  enquadramento: string;
}

export default function Home() {
  const [abaAtiva, setAbaAtiva] = useState<"laudo" | "s2240" | "s2220" | "s2210">("laudo");

  // Dados Gerais da Empresa & Técnico
  const [empresa, setEmpresa] = useState<string>("Metalúrgica Amazonas S.A.");
  const [cnpj, setCnpj] = useState<string>("12.345.678/0001-90");
  const [setor, setSetor] = useState<string>("Cabine de Pintura e Limpeza");
  const [ghe, setGhe] = useState<string>("Pintor Industrial / Reparador");
  const [responsavelTecnico, setResponsavelTecnico] = useState<string>("Thiago Soares da Rocha");
  const [crea, setCrea] = useState<string>("CREA/AM - 123456/D");

  // Dados do Trabalhador
  const [nomeTrabalhador, setNomeTrabalhador] = useState<string>("Carlos Eduardo da Silva");
  const [cpfTrabalhador, setCpfTrabalhador] = useState<string>("098.765.432-11");
  const [matricula, setMatricula] = useState<string>("MAT-1052");

  // Parâmetros de Avaliação (Químico / Físico)
  const [agenteKey, setAgenteKey] = useState<string>("tolueno");
  const [filtroBuscaQuimico, setFiltroBuscaQuimico] = useState<string>("");
  const [tipoAvaliacao, setTipoAvaliacao] = useState<"quant" | "qual">("quant");
  const [medicaoValor, setMedicaoValor] = useState<number>(85.5);
  const [epiEficaz, setEpiEficaz] = useState<boolean>(false);
  const [caEpi, setCaEpi] = useState<string>("41235");

  // Parâmetros S-2220 (Saúde / ASO)
  const [tipoAso, setTipoAso] = useState<"1" | "2" | "3" | "4">("2");
  const [dataAso, setDataAso] = useState<string>(new Date().toISOString().split("T")[0]);
  const [resultadoAso, setResultadoAso] = useState<"1" | "2">("1");
  const [medicoCrm, setMedicoCrm] = useState<string>("CRM/AM 7894");
  const [examesComplementares, setExamesComplementares] = useState<string>("0295 - Espirometria Ocupacional | 0005 - Hemograma Completo");

  // Parâmetros S-2210 (Acidente / CAT)
  const [dataAcidente, setDataAcidente] = useState<string>(new Date().toISOString().split("T")[0]);
  const [horaAcidente, setHoraAcidente] = useState<string>("14:30");
  const [tipoAcidente, setTipoAcidente] = useState<"1" | "2" | "3">("1");
  const [houveAfastamento, setHouveAfastamento] = useState<boolean>(false);
  const [cid10, setCid10] = useState<string>("S61.0 - Ferimento de dedo sem lesão da unha");
  const [parteCorpo, setParteCorpo] = useState<string>("Dedo da mão");

  const [historico, setHistorico] = useState<AvaliacaoHO[]>([]);

  const agenteAtual: AgenteCompleto =
    CATALAGO_QUIMICOS_COMPLETO[agenteKey] || CATALAGO_QUIMICOS_COMPLETO.tolueno;

  const carregarNuvem = async () => {
    try {
      const { data, error } = await supabase
        .from("avaliacoes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setHistorico(
          data.map((item: any) => ({
            id: item.id,
            data_medicao: item.data_medicao,
            agente: item.agente,
            codigo_esocial: item.codigo_esocial || "01.01.001",
            empresa_nome: item.parametros_campo?.split("|")[0] || empresa,
            ghe_nome: item.parametros_campo?.split("|")[1] || ghe,
            funcao: item.funcao,
            parametros_campo: item.parametros_campo || "",
            resultado_numerico: item.resultado_numerico,
            enquadramento: item.enquadramento,
          }))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    carregarNuvem();
  }, []);

  // Lógica Trabalhista (NR-15)
  let isInsalubre = false;
  let justificativaNR15 = "";

  if (agenteAtual.id === "benzeno") {
    isInsalubre = !epiEficaz;
    justificativaNR15 = epiEficaz
      ? "Exposição neutralizada administrativamente mediante comprovação de proteção respiratória com CA válido."
      : `Atividade INSALUBRE em ${agenteAtual.grau} conforme Anexo 13-A da NR-15 (Valor de Referência Tecnológico - VRT).`;
  } else if (tipoAvaliacao === "quant" && agenteAtual.lt_ppm !== null) {
    if (medicaoValor > agenteAtual.lt_ppm) {
      isInsalubre = !epiEficaz;
      justificativaNR15 = `Concentração apurada (${medicaoValor} ${agenteAtual.unidade}) ULTRAPASSOU o Limite de Tolerância (${agenteAtual.lt_ppm} ${agenteAtual.unidade}). ${
        epiEficaz
          ? "Contudo, comprovada a eficácia dos EPIs fornecidos com CA válido, a insalubridade resta descaracterizada."
          : `Caracteriza-se o Adicional de Insalubridade em ${agenteAtual.grau} pelo ${agenteAtual.anexoNR15} da NR-15.`
      }`;
    } else {
      isInsalubre = false;
      justificativaNR15 = `Concentração apurada (${medicaoValor} ${agenteAtual.unidade}) encontra-se ABAIXO do Limite de Tolerância regulamentar (${agenteAtual.lt_ppm} ${agenteAtual.unidade}).`;
    }
  } else {
    isInsalubre = true;
    justificativaNR15 = `Enquadramento qualitativo pelo Anexo 13 da NR-15 por inspeção no ambiente de trabalho.`;
  }

  // Lógica Previdenciária (LTCAT / LINACH)
  let isEspecial = false;
  let justificativaLTCAT = "";
  const isLinachGrupo1 = agenteAtual.linach.includes("Grupo 1");

  if (isLinachGrupo1) {
    isEspecial = true;
    justificativaLTCAT =
      "Agente cancerígeno listado no Grupo 1 da LINACH com registro CAS. Conforme art. 68, § 4º do Dec. 3.048/99 e Súmula 9 da TNU, a presença no ambiente garante o tempo especial, SENDO IRRELEVANTE A EFICÁCIA DO EPI.";
  } else if (tipoAvaliacao === "quant" && agenteAtual.lt_ppm !== null) {
    if (medicaoValor > agenteAtual.lt_ppm) {
      isEspecial = true;
      justificativaLTCAT = `Exposição acima do limite de tolerância em conformidade com o Anexo IV do Decreto 3.048/99 (${agenteAtual.dec3048}).`;
    } else {
      isEspecial = false;
      justificativaLTCAT =
        "Concentração mantida abaixo dos limites de tolerância. Ausência de enquadramento para aposentadoria especial.";
    }
  } else {
    isEspecial = true;
    justificativaLTCAT =
      "Enquadramento especial reconhecido com base na habitualidade e permanência da atividade insalubre.";
  }

  // Salvar no Supabase
  const salvarAvaliacaoNuvem = async () => {
    try {
      const { error } = await supabase.from("avaliacoes").insert([
        {
          agente: agenteAtual.name,
          codigo_esocial: agenteAtual.esocial,
          funcao: ghe,
          parametros_campo: `${empresa} | ${setor} | CAS: ${agenteAtual.cas}`,
          resultado_numerico:
            tipoAvaliacao === "quant" ? `${medicaoValor} ${agenteAtual.unidade}` : "Qualitativo",
          enquadramento: `${isInsalubre ? "Insalubre" : "Salubre"} | ${
            isEspecial ? "Aposentadoria Especial" : "Comum"
          }`,
          data_medicao: new Date().toISOString().split("T")[0],
        },
      ]);

      if (error) {
        alert(`Erro ao salvar no banco: ${error.message}`);
      } else {
        alert("Registro gravado com sucesso no PostgreSQL (Supabase)!");
        carregarNuvem();
      }
    } catch (e: any) {
      alert(`Falha: ${e.message}`);
    }
  };

  // Exportação Excel
  const exportarParaExcel = () => {
    if (historico.length === 0) {
      alert("Nenhum dado gravado para exportar!");
      return;
    }
    const ws = XLSX.utils.json_to_sheet(historico);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laudos_Periciais");
    XLSX.writeFile(wb, `Laudos_SST_${Date.now()}.xlsx`);
  };

  // XMLs S-2240, S-2220 e S-2210
  const downloadXmlS2240 = () => {
    const id = `ID1${cnpj.replace(/\D/g, "").padEnd(14, "0")}${Date.now().toString().slice(-14)}`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtExpRisco/v_S_01_02_00">
  <evtExpRisco Id="${id}">
    <ideEvento><tpAmb>1</tpAmb><procEmi>1</procEmi><verProc>HigienePro_Modern_2.0</verProc></ideEvento>
    <ideEmpregador><tpInsc>1</tpInsc><nrInsc>${cnpj.replace(/\D/g, "")}</nrInsc></ideEmpregador>
    <ideVinculo><cpfTrab>${cpfTrabalhador.replace(/\D/g, "")}</cpfTrab><matricula>${matricula}</matricula></ideVinculo>
    <infoExpRisco>
      <dtIniCondicao>${new Date().toISOString().split("T")[0]}</dtIniCondicao>
      <infoAmb><localAmb>1</localAmb><dscSetor>${setor}</dscSetor></infoAmb>
      <infoAtiv><dscAtivDes>${ghe} - Exposição ao agente ${agenteAtual.name}.</dscAtivDes></infoAtiv>
      <agenteNocivo>
        <fatRisco>
          <codFatRisco>${agenteAtual.esocial}</codFatRisco>
          <tpAval>${tipoAvaliacao === "quant" ? "1" : "2"}</tpAval>
          <intConc>${tipoAvaliacao === "quant" ? medicaoValor : "0"}</intConc>
          <unMed>${agenteAtual.unidade}</unMed>
          <epcEpi>
            <utilizEPC>2</utilizEPC>
            <utilizEPI>${epiEficaz ? "2" : "1"}</utilizEPI>
            <epi><docAval>${caEpi}</docAval></epi>
          </epcEpi>
        </fatRisco>
      </agenteNocivo>
      <respReg>
        <cpfResp>12345678900</cpfResp><ideOC>1</ideOC><nrOc>${crea.replace(/\D/g, "") || "123456"}</nrOc><ufOC>AM</ufOC>
      </respReg>
    </infoExpRisco>
  </evtExpRisco>
</eSocial>`;

    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `S2240_${agenteAtual.name}_${Date.now()}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadXmlS2220 = () => {
    const id = `ID1${cnpj.replace(/\D/g, "").padEnd(14, "0")}${Date.now().toString().slice(-14)}`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtMonit/v_S_01_02_00">
  <evtMonit Id="${id}">
    <ideEvento><tpAmb>1</tpAmb><procEmi>1</procEmi><verProc>HigienePro_Modern_2.0</verProc></ideEvento>
    <ideEmpregador><tpInsc>1</tpInsc><nrInsc>${cnpj.replace(/\D/g, "")}</nrInsc></ideEmpregador>
    <ideVinculo><cpfTrab>${cpfTrabalhador.replace(/\D/g, "")}</cpfTrab><matricula>${matricula}</matricula></ideVinculo>
    <aso>
      <dtAso>${dataAso}</dtAso>
      <tpAso>${tipoAso}</tpAso>
      <resAso>${resultadoAso}</resAso>
      <exame>
        <dtExm>${dataAso}</dtExm>
        <procRealizado>0295</procRealizado>
        <ordExm>1</ordExm>
        <indResult>1</indResult>
      </exame>
      <medico>
        <cpfMed>12345678901</cpfMed><nisMed>12345678901</nisMed>
        <nrCRM>${medicoCrm.replace(/\D/g, "") || "7894"}</nrCRM><ufCRM>AM</ufCRM>
      </medico>
    </aso>
  </evtMonit>
</eSocial>`;

    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `S2220_ASO_${Date.now()}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadXmlS2210 = () => {
    const id = `ID1${cnpj.replace(/\D/g, "").padEnd(14, "0")}${Date.now().toString().slice(-14)}`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtCAT/v_S_01_02_00">
  <evtCAT Id="${id}">
    <ideEvento><tpAmb>1</tpAmb><procEmi>1</procEmi><verProc>HigienePro_Modern_2.0</verProc></ideEvento>
    <ideEmpregador><tpInsc>1</tpInsc><nrInsc>${cnpj.replace(/\D/g, "")}</nrInsc></ideEmpregador>
    <ideVinculo><cpfTrab>${cpfTrabalhador.replace(/\D/g, "")}</cpfTrab><matricula>${matricula}</matricula></ideVinculo>
    <cat>
      <dtAcid>${dataAcidente}</dtAcid>
      <tpAcid>${tipoAcidente}</tpAcid>
      <hrAcid>${horaAcidente.replace(":", "")}00</hrAcid>
      <hrsTrabAntesAcid>0400</hrsTrabAntesAcid>
      <tpCat>1</tpCat>
      <indCatObito>N</indCatObito>
      <dtObito/>
      <indComunPolicia>N</indComunPolicia>
      <localAcidente>
        <tpLocal>1</tpLocal>
        <dscLocal>${setor}</dscLocal>
      </localAcidente>
      <parteAtingida>
        <codParteAting>${parteCorpo}</codParteAting>
      </parteAtingida>
      <atestado>
        <dtAtendimento>${dataAcidente}</dtAtendimento>
        <hrAtendimento>${horaAcidente.replace(":", "")}00</hrAtendimento>
        <indAfast>${houveAfastamento ? "S" : "N"}</indAfast>
        <codCID>${cid10.split(" - ")[0]}</codCID>
      </atestado>
    </cat>
  </evtCAT>
</eSocial>`;

    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `S2210_CAT_${Date.now()}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const listaFiltradaQuimicos = Object.values(CATALAGO_QUIMICOS_COMPLETO).filter((item) => {
    const t = filtroBuscaQuimico.toLowerCase();
    return (
      item.name.toLowerCase().includes(t) ||
      item.cas.toLowerCase().includes(t) ||
      item.esocial.toLowerCase().includes(t)
    );
  });

  return (
    <div className="bg-[#FAF7F2] text-[#1E293B] min-h-screen font-sans selection:bg-[#E2D4BA] selection:text-[#0F172A]">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* ========================================================
            HEADER MODERNO: AZUL PETRÓLEO PROFUNDO COM DETALHES BEGE
           ======================================================== */}
        <header className="print:hidden bg-[#0F172A] border border-[#1E293B] text-white rounded-2xl p-6 mb-8 shadow-xl relative overflow-hidden">
          {/* Brilho de fundo sutil */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/3 -bottom-20 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <div className="flex items-center gap-3">
                <span className="bg-[#D97706]/20 border border-[#D97706]/40 text-[#FDE68A] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm">
                  Executive SST
                </span>
                <span className="text-xs font-medium text-slate-400">v2.4 Pro</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-2 tracking-tight">
                Higiene Ocupacional & eSocial
              </h1>
              <p className="text-sm text-[#CBD5E1] mt-1 max-w-xl font-normal leading-relaxed">
                Plataforma técnica pericial para emissão de laudos de insalubridade (NR-15), LTCAT e geração dos eventos S-2240, S-2220 e S-2210.
              </p>
            </div>

            {/* SELETOR DE MÓDULOS (ABAS EM BEGE E AZUL) */}
            <div className="flex flex-wrap items-center gap-2 bg-[#1E293B]/80 p-1.5 rounded-xl border border-slate-700/60 backdrop-blur-md">
              <button
                onClick={() => setAbaAtiva("laudo")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  abaAtiva === "laudo"
                    ? "bg-[#F5F0E6] text-[#0F172A] shadow-md shadow-black/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                📄 Laudo A4
              </button>
              <button
                onClick={() => setAbaAtiva("s2240")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  abaAtiva === "s2240"
                    ? "bg-[#F5F0E6] text-[#0F172A] shadow-md shadow-black/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                🛡️ S-2240
              </button>
              <button
                onClick={() => setAbaAtiva("s2220")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  abaAtiva === "s2220"
                    ? "bg-[#F5F0E6] text-[#0F172A] shadow-md shadow-black/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                🩺 S-2220
              </button>
              <button
                onClick={() => setAbaAtiva("s2210")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  abaAtiva === "s2210"
                    ? "bg-[#F5F0E6] text-[#0F172A] shadow-md shadow-black/20"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                ⚠️ S-2210
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-[#1E3A8A] text-white hover:bg-blue-800 transition-all border border-blue-400/30 shadow-sm"
              >
                🖨️ Imprimir
              </button>
            </div>
          </div>
        </header>

        {/* ========================================================
            1. MÓDULO LAUDO PERICIAL (SPLIT EM 12 COLUNAS)
           ======================================================== */}
        {abaAtiva === "laudo" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
            
            {/* COLUNA ESQUERDA: PARÂMETROS COM TONS BEGE E AZUL */}
            <div className="print:hidden lg:col-span-5 space-y-6">
              <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E8DEC8] shadow-sm hover:shadow-md transition-shadow">
                
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#F0E8D8]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1E3A8A]"></span>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
                      Parâmetros da Avaliação
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold bg-[#F5F0E6] text-[#854D0E] px-2.5 py-0.5 rounded-full border border-[#E8DEC8]">
                    {Object.keys(CATALAGO_QUIMICOS_COMPLETO).length} Agentes
                  </span>
                </div>

                {/* BUSCA RÁPIDA */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="🔎 Filtrar agente (ex: Tolueno, Sílica, Benzeno, CAS)..."
                    value={filtroBuscaQuimico}
                    onChange={(e) => setFiltroBuscaQuimico(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none transition-all"
                  />
                </div>

                {/* SELEÇÃO DO AGENTE */}
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                    Agente Químico Selecionado
                  </label>
                  <select
                    value={agenteKey}
                    onChange={(e) => {
                      const k = e.target.value;
                      setAgenteKey(k);
                      const novo = CATALAGO_QUIMICOS_COMPLETO[k];
                      setTipoAvaliacao(novo.typeDefault);
                      if (novo.lt_ppm) setMedicaoValor(novo.lt_ppm * 1.1);
                    }}
                    className="w-full p-3 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-semibold text-[#0F172A] focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none transition-all"
                  >
                    {listaFiltradaQuimicos.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        [{ag.esocial}] {ag.name} (CAS {ag.cas})
                      </option>
                    ))}
                  </select>
                </div>

                {/* EMPRESA & CNPJ */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475569] mb-1">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475569] mb-1">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-mono font-medium focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                    />
                  </div>
                </div>

                {/* SETOR & GHE */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475569] mb-1">
                      Setor / Local
                    </label>
                    <input
                      type="text"
                      value={setor}
                      onChange={(e) => setSetor(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475569] mb-1">
                      GHE / Cargo
                    </label>
                    <input
                      type="text"
                      value={ghe}
                      onChange={(e) => setGhe(e.target.value)}
                      className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                    />
                  </div>
                </div>

                {/* ABORDAGEM DE AVALIAÇÃO */}
                <div className="mb-4">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#475569] mb-1.5">
                    Abordagem de Avaliação
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTipoAvaliacao("quant")}
                      className={`p-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                        tipoAvaliacao === "quant"
                          ? "border-[#1E3A8A] bg-[#1E3A8A] text-white shadow-sm"
                          : "border-[#E8DEC8] bg-[#FAF7F2] text-[#475569] hover:bg-[#F5F0E6]"
                      }`}
                    >
                      📈 Quantitativa
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoAvaliacao("qual")}
                      className={`p-2.5 text-xs font-bold rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                        tipoAvaliacao === "qual"
                          ? "border-[#1E3A8A] bg-[#1E3A8A] text-white shadow-sm"
                          : "border-[#E8DEC8] bg-[#FAF7F2] text-[#475569] hover:bg-[#F5F0E6]"
                      }`}
                    >
                      👁️ Qualitativa
                    </button>
                  </div>
                </div>

                {/* CAMPO QUANTITATIVO */}
                {tipoAvaliacao === "quant" && (
                  <div className="p-4 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl mb-4 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#0F172A]">Medição Apurada em Campo</span>
                      <span className="font-mono text-slate-500">Unidade: {agenteAtual.unidade}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.001"
                        value={medicaoValor}
                        onChange={(e) => setMedicaoValor(parseFloat(e.target.value) || 0)}
                        className="w-full p-2.5 bg-white border border-[#E8DEC8] rounded-lg text-sm font-bold text-[#0F172A] focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                      />
                      <div className="text-xs text-slate-500 shrink-0 bg-white px-3 py-2 rounded-lg border border-[#E8DEC8]">
                        LT:{" "}
                        <span className="font-bold text-[#0F172A]">
                          {agenteAtual.lt_ppm ? `${agenteAtual.lt_ppm} ${agenteAtual.unidade}` : "VRT / Qualitativo"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* EPI EFICAZ */}
                <div className="p-3.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl space-y-2 mb-5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#0F172A] cursor-pointer">
                      EPI Eficaz com C.A. Válido?
                    </label>
                    <input
                      type="checkbox"
                      checked={epiEficaz}
                      onChange={(e) => setEpiEficaz(e.target.checked)}
                      className="w-4 h-4 text-[#1E3A8A] rounded border-[#E8DEC8] focus:ring-[#1E3A8A] cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    *Para cancerígenos da LINACH Grupo 1, a jurisprudência previdenciária e a Súmula 9 da TNU desconsideram a eficácia do EPI para tempo especial.
                  </p>
                </div>

                {/* BOTÕES DE GRAVAÇÃO */}
                <div className="space-y-2">
                  <button
                    onClick={salvarAvaliacaoNuvem}
                    className="w-full py-3 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    💾 Salvar no PostgreSQL (Supabase)
                  </button>
                  <button
                    onClick={exportarParaExcel}
                    className="w-full py-2.5 bg-[#F5F0E6] hover:bg-[#EAE0D0] text-[#0F172A] border border-[#E8DEC8] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                  >
                    📊 Exportar Relatório Excel
                  </button>
                </div>
              </div>
            </div>

            {/* ========================================================
                COLUNA DIREITA: PRÉVIA DO LAUDO A4 MODERNO (BEGE & AZUL)
               ======================================================== */}
            <div className="lg:col-span-7 print:w-full">
              <div className="bg-white p-8 md:p-10 rounded-2xl border border-[#E8DEC8] shadow-md text-[#1E293B] print:shadow-none print:border-none print:p-0">
                
                {/* CABEÇALHO DO LAUDO */}
                <div className="border-b-2 border-[#0F172A] pb-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                  <div>
                    <div className="inline-block text-[11px] font-black uppercase tracking-widest text-[#1E3A8A] bg-[#F5F0E6] px-2.5 py-0.5 rounded border border-[#E8DEC8]">
                      Parecer Técnico Pericial
                    </div>
                    <h2 className="text-xl md:text-2xl font-black text-[#0F172A] mt-1.5 tracking-tight">
                      ENQUADRAMENTO NR-15 E LTCAT
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fundamentação: Portaria MTE 3.214/78 & Decreto Federal 3.048/99
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div>Data: <strong className="text-[#0F172A]">{new Date().toLocaleDateString("pt-BR")}</strong></div>
                    <div className="mt-0.5 font-mono text-[11px] text-slate-400">ID: HO-LAUDO-2026-9482</div>
                  </div>
                </div>

                {/* IDENTIFICAÇÃO DO POSTO */}
                <div className="bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl p-4 mb-6 text-xs grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 font-bold uppercase block text-[10px] tracking-wider">
                      GHE / Cargo Avaliado:
                    </span>
                    <span className="font-semibold text-[#0F172A] text-sm">{ghe}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase block text-[10px] tracking-wider">
                      Setor / Local:
                    </span>
                    <span className="font-semibold text-[#0F172A] text-sm">{setor}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase block text-[10px] tracking-wider">
                      Agente Químico:
                    </span>
                    <span className="font-bold text-[#1E3A8A] text-sm">{agenteAtual.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase block text-[10px] tracking-wider">
                      Registro CAS:
                    </span>
                    <span className="font-mono font-bold text-[#0F172A] text-sm">{agenteAtual.cas}</span>
                  </div>
                </div>

                {/* SEÇÃO 1: CONCLUSÃO NR-15 (TRABALHISTA) */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                    <span className="text-[#1E3A8A] font-bold">🛡️</span> 1. Conclusão Trabalhista - Adicional de Insalubridade (NR-15)
                  </h3>
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      isInsalubre
                        ? "border-rose-300 bg-rose-50/70"
                        : "border-emerald-300 bg-emerald-50/70"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full tracking-wide ${
                          isInsalubre
                            ? "bg-rose-700 text-white"
                            : "bg-emerald-700 text-white"
                        }`}
                      >
                        {isInsalubre ? "FAZ JUS À INSALUBRIDADE" : "NÃO CARACTERIZADA INSALUBRIDADE"}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          isInsalubre ? "text-rose-800" : "text-emerald-800"
                        }`}
                      >
                        {isInsalubre ? agenteAtual.grau : "Não aplicável"}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700">{justificativaNR15}</p>
                  </div>
                </div>

                {/* SEÇÃO 2: CONCLUSÃO LTCAT (PREVIDENCIÁRIA) */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                    <span className="text-[#1E3A8A] font-bold">📋</span> 2. Conclusão Previdenciária - Aposentadoria Especial (LTCAT)
                  </h3>
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      isEspecial
                        ? "border-amber-300 bg-[#FFFBEB]"
                        : "border-[#E8DEC8] bg-[#FAF7F2]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full tracking-wide ${
                          isEspecial
                            ? "bg-[#92400E] text-white"
                            : "bg-slate-600 text-white"
                        }`}
                      >
                        {isEspecial ? "GERA APOSENTADORIA ESPECIAL" : "TEMPO COMUM (SEM APOSENTADORIA ESPECIAL)"}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          isEspecial ? "text-[#92400E]" : "text-slate-600"
                        }`}
                      >
                        {isEspecial ? `Tempo: ${agenteAtual.anosAposentadoria}` : "Não elegível"}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-700 mb-3">{justificativaLTCAT}</p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/90 p-3 rounded-lg border border-[#E8DEC8]">
                      <div>
                        <span className="text-slate-400 block font-medium text-[10px]">Código eSocial (Tab. 24):</span>
                        <span className="font-mono font-bold text-[#1E3A8A]">{agenteAtual.esocial}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium text-[10px]">Classificação LINACH:</span>
                        <span className="font-bold text-[#0F172A]">{agenteAtual.linach}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEÇÃO 3: EMBASAMENTO LEGAL CONSOLIDADO */}
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    3. Fundamentação Técnica e Jurídica Consolidada
                  </h3>
                  <div className="text-[11px] text-slate-700 leading-relaxed bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DEC8] space-y-2">
                    <p>{agenteAtual.legalText}</p>
                    <p className="border-t border-[#E8DEC8] pt-2 font-medium text-[#0F172A]">
                      {isLinachGrupo1
                        ? "⚠️ Alerta Previdenciário: Por tratar-se de agente carcinogênico do Grupo 1, a eficácia do EPI não anula o enquadramento de tempo especial nem o envio do código de risco ao eSocial."
                        : "A adoção de EPIs com C.A. válido atenua a exposição para fins da CLT, desde que comprovado o uso efetivo e registro de entrega."}
                    </p>
                  </div>
                </div>

                {/* ASSINATURAS PERICIAIS */}
                <div className="mt-12 pt-6 border-t border-[#CBD5E1] grid grid-cols-2 gap-8 text-center text-xs">
                  <div>
                    <div className="border-b border-[#0F172A] mb-1.5 w-44 mx-auto"></div>
                    <span className="font-bold text-[#0F172A] block">{empresa}</span>
                    <span className="text-slate-400 text-[10px]">Empregador / Preposto</span>
                  </div>
                  <div>
                    <div className="border-b border-[#0F172A] mb-1.5 w-44 mx-auto"></div>
                    <span className="font-bold text-[#0F172A] block">{responsavelTecnico}</span>
                    <span className="text-slate-500 text-[10px]">{crea}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ========================================================
            2. MÓDULO S-2240 (CONDIÇÕES AMBIENTAIS)
           ======================================================== */}
        {abaAtiva === "s2240" && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8DEC8] shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E8D8] pb-5">
              <div>
                <div className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#1E3A8A] bg-[#F5F0E6] px-2 py-0.5 rounded mb-1">
                  Evento Pericial eSocial
                </div>
                <h2 className="text-xl font-black text-[#0F172A]">
                  S-2240 - Condições Ambientais do Trabalho (Agentes Nocivos)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Preenchimento dos fatores de risco, identificação do trabalhador e responsáveis pelo registro ambiental.
                </p>
              </div>
              <button
                onClick={downloadXmlS2240}
                className="px-5 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                ⚡ Baixar Arquivo XML (S-2240)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Nome do Trabalhador</label>
                <input
                  type="text"
                  value={nomeTrabalhador}
                  onChange={(e) => setNomeTrabalhador(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">CPF Trabalhador</label>
                <input
                  type="text"
                  value={cpfTrabalhador}
                  onChange={(e) => setCpfTrabalhador(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-mono font-medium focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Matrícula no RH</label>
                <input
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-mono font-medium focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E8DEC8] space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A]">
                Parâmetros Declarados no Evento
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Código Tabela 24:</span>
                  <strong className="font-mono text-[#1E3A8A]">{agenteAtual.esocial}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Agente Nocivo:</span>
                  <strong className="text-[#0F172A]">{agenteAtual.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Concentração Declarada:</span>
                  <strong className="text-[#0F172A]">
                    {tipoAvaliacao === "quant" ? `${medicaoValor} ${agenteAtual.unidade}` : "Qualitativo"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">C.A. do EPI:</span>
                  <input
                    type="text"
                    value={caEpi}
                    onChange={(e) => setCaEpi(e.target.value)}
                    className="p-1.5 border border-[#E8DEC8] rounded-lg w-28 bg-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            3. MÓDULO S-2220 (SAÚDE / ASO)
           ======================================================== */}
        {abaAtiva === "s2220" && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8DEC8] shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E8D8] pb-5">
              <div>
                <div className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#1E3A8A] bg-[#F5F0E6] px-2 py-0.5 rounded mb-1">
                  Medicina Ocupacional
                </div>
                <h2 className="text-xl font-black text-[#0F172A]">
                  S-2220 - Monitoramento da Saúde do Trabalhador (ASO)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registro de Atestados de Saúde Ocupacional e exames complementares do PCMSO.
                </p>
              </div>
              <button
                onClick={downloadXmlS2220}
                className="px-5 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                ⚡ Baixar Arquivo XML (S-2220)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Tipo de ASO</label>
                <select
                  value={tipoAso}
                  onChange={(e: any) => setTipoAso(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                >
                  <option value="1">1 - Admissional</option>
                  <option value="2">2 - Periódico</option>
                  <option value="3">3 - Retorno ao Trabalho</option>
                  <option value="4">4 - Demissional</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Data da Emissão</label>
                <input
                  type="date"
                  value={dataAso}
                  onChange={(e) => setDataAso(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Resultado Clínico</label>
                <select
                  value={resultadoAso}
                  onChange={(e: any) => setResultadoAso(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                >
                  <option value="1">1 - Apto</option>
                  <option value="2">2 - Inapto</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Médico Responsável (CRM)</label>
                <input
                  type="text"
                  value={medicoCrm}
                  onChange={(e) => setMedicoCrm(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1">Exames Complementares Realizados</label>
              <input
                type="text"
                value={examesComplementares}
                onChange={(e) => setExamesComplementares(e.target.value)}
                className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* ========================================================
            4. MÓDULO S-2210 (ACIDENTES / CAT)
           ======================================================== */}
        {abaAtiva === "s2210" && (
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-[#E8DEC8] shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F0E8D8] pb-5">
              <div>
                <div className="inline-block text-[10px] font-bold uppercase tracking-widest text-[#1E3A8A] bg-[#F5F0E6] px-2 py-0.5 rounded mb-1">
                  Comunicação de Sinistro
                </div>
                <h2 className="text-xl font-black text-[#0F172A]">
                  S-2210 - Comunicação de Acidente de Trabalho (CAT)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registro oficial de acidentes de trabalho típicos, de trajeto ou doenças ocupacionais.
                </p>
              </div>
              <button
                onClick={downloadXmlS2210}
                className="px-5 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
              >
                ⚡ Baixar Arquivo XML (S-2210)
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Tipo de Acidente</label>
                <select
                  value={tipoAcidente}
                  onChange={(e: any) => setTipoAcidente(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                >
                  <option value="1">1 - Típico</option>
                  <option value="2">2 - Trajeto</option>
                  <option value="3">3 - Doença Ocupacional</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Data do Ocorrido</label>
                <input
                  type="date"
                  value={dataAcidente}
                  onChange={(e) => setDataAcidente(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Horário do Acidente</label>
                <input
                  type="time"
                  value={horaAcidente}
                  onChange={(e) => setHoraAcidente(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Houve Afastamento?</label>
                <select
                  value={houveAfastamento ? "sim" : "nao"}
                  onChange={(e) => setHouveAfastamento(e.target.value === "sim")}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                >
                  <option value="nao">Não (Retorno às atividades)</option>
                  <option value="sim">Sim (Afastamento do trabalho)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Diagnóstico Médico (CID-10)</label>
                <input
                  type="text"
                  value={cid10}
                  onChange={(e) => setCid10(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-mono font-medium focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#475569] mb-1">Parte do Corpo Atingida</label>
                <input
                  type="text"
                  value={parteCorpo}
                  onChange={(e) => setParteCorpo(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-[#1E3A8A] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}