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
  // Controle de abas principais
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
  const [dataAdmissao, setDataAdmissao] = useState<string>("2024-03-01");

  // Parâmetros de Avaliação de Risco (Químico / Físico)
  const [agenteKey, setAgenteKey] = useState<string>("tolueno");
  const [filtroBuscaQuimico, setFiltroBuscaQuimico] = useState<string>("");
  const [tipoAvaliacao, setTipoAvaliacao] = useState<"quant" | "qual">("quant");
  const [medicaoValor, setMedicaoValor] = useState<number>(85.5);
  const [epiEficaz, setEpiEficaz] = useState<boolean>(false);
  const [caEpi, setCaEpi] = useState<string>("41235");

  // Parâmetros S-2220 (Saúde / ASO)
  const [tipoAso, setTipoAso] = useState<"1" | "2" | "3" | "4">("2"); // 1=Adm, 2=Periódico, 3=Retorno, 4=Demissional
  const [dataAso, setDataAso] = useState<string>(new Date().toISOString().split("T")[0]);
  const [resultadoAso, setResultadoAso] = useState<"1" | "2">("1"); // 1=Apto, 2=Inapto
  const [medicoCrm, setMedicoCrm] = useState<string>("CRM/AM 7894");
  const [examesComplementares, setExamesComplementares] = useState<string>("0295 - Espirometria Ocupacional | 0005 - Hemograma Completo");

  // Parâmetros S-2210 (Acidente / CAT)
  const [dataAcidente, setDataAcidente] = useState<string>(new Date().toISOString().split("T")[0]);
  const [horaAcidente, setHoraAcidente] = useState<string>("14:30");
  const [tipoAcidente, setTipoAcidente] = useState<"1" | "2" | "3">("1"); // 1=Típico, 2=Trajeto, 3=Doença
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
      "Agente cancerígeno listado no Grupo 1 da LINACH com registro CAS. Nos termos do art. 68, § 4º do Dec. 3.048/99 e da Súmula 9 da TNU, a presença no ambiente garante o tempo especial, SENDO IRRELEVANTE A EFICÁCIA DO EPI.";
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

  // Gravação na Nuvem (PostgreSQL)
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

  // Gerador S-2240 (Condições Ambientais)
  const downloadXmlS2240 = () => {
    const id = `ID1${cnpj.replace(/\D/g, "").padEnd(14, "0")}${Date.now().toString().slice(-14)}`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtExpRisco/v_S_01_02_00">
  <evtExpRisco Id="${id}">
    <ideEvento><tpAmb>1</tpAmb><procEmi>1</procEmi><verProc>HigienePro_1.0</verProc></ideEvento>
    <ideEmpregador><tpInsc>1</tpInsc><nrInsc>${cnpj.replace(/\D/g, "")}</nrInsc></ideEmpregador>
    <ideVinculo><cpfTrab>${cpfTrabalhador.replace(/\D/g, "")}</cpfTrab><matricula>${matricula}</matricula></ideVinculo>
    <infoExpRisco>
      <dtIniCondicao>${new Date().toISOString().split("T")[0]}</dtIniCondicao>
      <infoAmb><localAmb>1</localAmb><dscSetor>${setor}</dscSetor></infoAmb>
      <infoAtiv><dscAtivDes>${ghe} - Operações expostas ao agente ${agenteAtual.name}.</dscAtivDes></infoAtiv>
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

  // Gerador S-2220 (Monitoramento de Saúde / ASO)
  const downloadXmlS2220 = () => {
    const id = `ID1${cnpj.replace(/\D/g, "").padEnd(14, "0")}${Date.now().toString().slice(-14)}`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtMonit/v_S_01_02_00">
  <evtMonit Id="${id}">
    <ideEvento><tpAmb>1</tpAmb><procEmi>1</procEmi><verProc>HigienePro_1.0</verProc></ideEvento>
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
        <cpfMed>12345678901</cpfMed>
        <nisMed>12345678901</nisMed>
        <nrCRM>${medicoCrm.replace(/\D/g, "") || "7894"}</nrCRM>
        <ufCRM>AM</ufCRM>
      </medico>
    </aso>
  </evtMonit>
</eSocial>`;

    const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `S2220_ASO_${cpfTrabalhador.replace(/\D/g, "")}_${Date.now()}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Gerador S-2210 (Comunicação de Acidente de Trabalho - CAT)
  const downloadXmlS2210 = () => {
    const id = `ID1${cnpj.replace(/\D/g, "").padEnd(14, "0")}${Date.now().toString().slice(-14)}`;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtCAT/v_S_01_02_00">
  <evtCAT Id="${id}">
    <ideEvento><tpAmb>1</tpAmb><procEmi>1</procEmi><verProc>HigienePro_1.0</verProc></ideEvento>
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
    a.download = `S2210_CAT_${cpfTrabalhador.replace(/\D/g, "")}_${Date.now()}.xml`;
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
    <div className="bg-slate-100 text-slate-900 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* CABEÇALHO COM SELEÇÃO DE MÓDULOS (NO-PRINT) */}
        <header className="print:hidden flex flex-col md:flex-row justify-between items-start md:items-center pb-6 mb-8 border-b border-slate-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded tracking-wide">
                HigieneWeb Pro
              </span>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                Emissão Técnica: Laudo NR-15 & eSocial SST
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Catálogo de Químicos (NR-15/LINACH) e Tríade eSocial (S-2240, S-2220 e S-2210)
            </p>
          </div>

          {/* NAVEGAÇÃO DE ABAS */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setAbaAtiva("laudo")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                abaAtiva === "laudo" ? "bg-indigo-600 text-white shadow" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              📄 Laudo NR-15 & LTCAT
            </button>
            <button
              onClick={() => setAbaAtiva("s2240")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                abaAtiva === "s2240" ? "bg-indigo-600 text-white shadow" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              🛡️ S-2240 (Riscos)
            </button>
            <button
              onClick={() => setAbaAtiva("s2220")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                abaAtiva === "s2220" ? "bg-indigo-600 text-white shadow" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              🩺 S-2220 (ASO / Saúde)
            </button>
            <button
              onClick={() => setAbaAtiva("s2210")}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                abaAtiva === "s2210" ? "bg-indigo-600 text-white shadow" : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              ⚠️ S-2210 (CAT / Acidente)
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              🖨️ Imprimir (A4)
            </button>
          </div>
        </header>

        {/* 1. MÓDULO LAUDO PERICIAL (SPLIT EM 12 COLUNAS) */}
        {abaAtiva === "laudo" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
            
            {/* COLUNA ESQUERDA: PARÂMETROS */}
            <div className="print:hidden lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <span className="text-indigo-600 font-bold">⚙️</span> Biblioteca de Químicos
                  </h2>
                  <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-200">
                    {Object.keys(CATALAGO_QUIMICOS_COMPLETO).length} Substâncias
                  </span>
                </div>

                {/* BUSCA RÁPIDA NO CATÁLOGO */}
                <div className="mb-3">
                  <input
                    type="text"
                    placeholder="🔎 Filtrar (ex: Tolueno, Sílica, Benzeno, CAS)..."
                    value={filtroBuscaQuimico}
                    onChange={(e) => setFiltroBuscaQuimico(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                {/* SELEÇÃO DO AGENTE */}
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Agente Químico Avaliado
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    {listaFiltradaQuimicos.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        [{ag.esocial}] {ag.name} (CAS {ag.cas})
                      </option>
                    ))}
                  </select>
                </div>

                {/* DADOS DA EMPRESA E SETOR */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Empresa</label>
                    <input
                      type="text"
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">CNPJ</label>
                    <input
                      type="text"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">Setor / Local</label>
                    <input
                      type="text"
                      value={setor}
                      onChange={(e) => setSetor(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">GHE / Cargo</label>
                    <input
                      type="text"
                      value={ghe}
                      onChange={(e) => setGhe(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* TIPO DE AVALIAÇÃO */}
                <div className="mb-4">
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Abordagem de Avaliação
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTipoAvaliacao("quant")}
                      className={`p-2.5 text-xs font-bold rounded-lg border transition ${
                        tipoAvaliacao === "quant"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-300 bg-white text-slate-600"
                      }`}
                    >
                      📈 Quantitativa
                    </button>
                    <button
                      type="button"
                      onClick={() => setTipoAvaliacao("qual")}
                      className={`p-2.5 text-xs font-bold rounded-lg border transition ${
                        tipoAvaliacao === "qual"
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                          : "border-slate-300 bg-white text-slate-600"
                      }`}
                    >
                      👁️ Qualitativa
                    </button>
                  </div>
                </div>

                {tipoAvaliacao === "quant" && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-700">Resultado da Medição</span>
                      <span className="text-xs font-mono text-slate-500">Unidade: {agenteAtual.unidade}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="0.001"
                        value={medicaoValor}
                        onChange={(e) => setMedicaoValor(parseFloat(e.target.value) || 0)}
                        className="w-full p-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-800"
                      />
                      <div className="text-xs text-slate-500 shrink-0">
                        LT:{" "}
                        <span className="font-bold text-slate-700">
                          {agenteAtual.lt_ppm ? `${agenteAtual.lt_ppm} ${agenteAtual.unidade}` : "VRT / Qualitativo"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* EPI EFICAZ */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 cursor-pointer">
                      EPI Eficaz com CA Válido?
                    </label>
                    <input
                      type="checkbox"
                      checked={epiEficaz}
                      onChange={(e) => setEpiEficaz(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 cursor-pointer"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    *Nota: Cancerígenos (LINACH Grupo 1 com CAS) desconsideram a eficácia do EPI para aposentadoria especial (Súmula 9 da TNU).
                  </p>
                </div>

                {/* BOTÕES DE AÇÃO */}
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <button
                    onClick={salvarAvaliacaoNuvem}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    💾 Salvar no PostgreSQL (Supabase)
                  </button>
                  <button
                    onClick={exportarParaExcel}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    📊 Exportar Banco para Excel
                  </button>
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA: LAUDO TÉCNICO A4 */}
            <div className="lg:col-span-7 print:w-full">
              <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-slate-800 print:shadow-none print:border-none print:p-0">
                
                <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-start">
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-indigo-700">
                      Parecer Técnico Pericial Conclusivo
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mt-0.5">
                      ENQUADRAMENTO NR-15 E LTCAT
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Conformidade: Portaria MTE 3.214/78 & Decreto Federal 3.048/99
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div>
                      Data de Emissão:{" "}
                      <span className="font-bold text-slate-700">
                        {new Date().toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-slate-400">
                      ID: HO-LAUDO-2026-9482
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-xs grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 font-bold uppercase block">GHE / Cargo:</span>
                    <span className="font-semibold text-slate-800 text-sm">{ghe}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase block">Setor Avaliado:</span>
                    <span className="font-semibold text-slate-800 text-sm">{setor}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase block">Agente Químico:</span>
                    <span className="font-bold text-indigo-700 text-sm">{agenteAtual.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold uppercase block">Registro CAS:</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{agenteAtual.cas}</span>
                  </div>
                </div>

                {/* CONCLUSÃO NR-15 */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <span className="text-indigo-600 font-bold">🛡️</span> 1. Conclusão Trabalhista - Adicional de Insalubridade (NR-15)
                  </h3>
                  <div
                    className={`p-4 rounded-lg border transition ${
                      isInsalubre ? "border-rose-200 bg-rose-50/60" : "border-emerald-200 bg-emerald-50/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded tracking-wide ${
                          isInsalubre ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
                        }`}
                      >
                        {isInsalubre ? "FAZ JUS À INSALUBRIDADE" : "NÃO CARACTERIZADA INSALUBRIDADE"}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          isInsalubre ? "text-rose-700" : "text-emerald-700"
                        }`}
                      >
                        {isInsalubre ? agenteAtual.grau : "Não aplicável"}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">{justificativaNR15}</p>
                  </div>
                </div>

                {/* CONCLUSÃO LTCAT */}
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                    <span className="text-indigo-600 font-bold">📋</span> 2. Conclusão Previdenciária - Aposentadoria Especial (LTCAT)
                  </h3>
                  <div
                    className={`p-4 rounded-lg border transition ${
                      isEspecial ? "border-purple-200 bg-purple-50/60" : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-xs font-black px-2.5 py-1 rounded tracking-wide ${
                          isEspecial ? "bg-purple-700 text-white" : "bg-slate-500 text-white"
                        }`}
                      >
                        {isEspecial ? "GERA APOSENTADORIA ESPECIAL" : "TEMPO COMUM (SEM APOSENTADORIA ESPECIAL)"}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          isEspecial ? "text-purple-800" : "text-slate-500"
                        }`}
                      >
                        {isEspecial ? `Tempo: ${agenteAtual.anosAposentadoria}` : "Não elegível"}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed mb-3">{justificativaLTCAT}</p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-white/70 p-2.5 rounded border border-slate-200">
                      <div>
                        <span className="text-slate-400 block font-medium">Código eSocial (Tab. 24):</span>
                        <span className="font-mono font-bold text-slate-800">{agenteAtual.esocial}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Classificação LINACH:</span>
                        <span className="font-bold text-slate-800">{agenteAtual.linach}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* EMBASAMENTO */}
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    3. Fundamentação Técnica e Jurídica Consolidada
                  </h3>
                  <div className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                    <p>{agenteAtual.legalText}</p>
                    <p className="border-t border-slate-200 pt-2 font-medium text-slate-700">
                      {isLinachGrupo1
                        ? "⚠️ Alerta Técnico Previdenciário: Por tratar-se de agente cancerígeno humano comprovado (Grupo 1), a eficácia de EPI NÃO anula o lançamento no S-2240 nem retira o direito à aposentadoria especial."
                        : "Adoção de EPIs com Certificado de Aprovação (CA) válido atenua a exposição para fins trabalhistas da CLT, desde que comprovado o treinamento e fiscalização contínua de uso."}
                    </p>
                  </div>
                </div>

                {/* ASSINATURAS */}
                <div className="mt-12 pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
                  <div>
                    <div className="border-b border-slate-400 mb-1 w-48 mx-auto"></div>
                    <span className="font-bold text-slate-800 block">{empresa}</span>
                    <span className="text-slate-400 text-[10px]">Empregador / Preposto</span>
                  </div>
                  <div>
                    <div className="border-b border-slate-400 mb-1 w-48 mx-auto"></div>
                    <span className="font-bold text-slate-800 block">{responsavelTecnico}</span>
                    <span className="text-slate-400 text-[10px]">{crea}</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* 2. MÓDULO EVENTO S-2240 (CONDIÇÕES AMBIENTAIS) */}
        {abaAtiva === "s2240" && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-800">
                  Evento S-2240 - Condições Ambientais do Trabalho (Agentes Nocivos)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Informações de exposição a fatores de risco para composição do PPP Eletrônico.
                </p>
              </div>
              <button
                onClick={downloadXmlS2240}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5"
              >
                ⚡ Gerar & Baixar XML S-2240
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Nome do Trabalhador</label>
                <input
                  type="text"
                  value={nomeTrabalhador}
                  onChange={(e) => setNomeTrabalhador(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">CPF Trabalhador</label>
                <input
                  type="text"
                  value={cpfTrabalhador}
                  onChange={(e) => setCpfTrabalhador(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Matrícula no RH</label>
                <input
                  type="text"
                  value={matricula}
                  onChange={(e) => setMatricula(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-mono"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-700">Fator de Risco Declarado</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Código Tabela 24:</span>
                  <strong className="font-mono text-indigo-700">{agenteAtual.esocial}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Descrição:</span>
                  <strong>{agenteAtual.name}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Intensidade / Concentração:</span>
                  <strong>{tipoAvaliacao === "quant" ? `${medicaoValor} ${agenteAtual.unidade}` : "Não aplicável"}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">C.A. do EPI:</span>
                  <input
                    type="text"
                    value={caEpi}
                    onChange={(e) => setCaEpi(e.target.value)}
                    className="p-1 border border-slate-300 rounded w-24 bg-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. MÓDULO EVENTO S-2220 (MONITORAMENTO DA SAÚDE / ASO) */}
        {abaAtiva === "s2220" && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-800">
                  Evento S-2220 - Monitoramento da Saúde do Trabalhador (ASO)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registro de Atestados de Saúde Ocupacional e exames complementares (PCMSO).
                </p>
              </div>
              <button
                onClick={downloadXmlS2220}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5"
              >
                ⚡ Gerar & Baixar XML S-2220
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tipo de ASO</label>
                <select
                  value={tipoAso}
                  onChange={(e: any) => setTipoAso(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-semibold"
                >
                  <option value="1">1 - Admissional</option>
                  <option value="2">2 - Periódico</option>
                  <option value="3">3 - Retorno ao Trabalho</option>
                  <option value="4">4 - Demissional</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Data da Emissão</label>
                <input
                  type="date"
                  value={dataAso}
                  onChange={(e) => setDataAso(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Resultado Clínico</label>
                <select
                  value={resultadoAso}
                  onChange={(e: any) => setResultadoAso(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-semibold"
                >
                  <option value="1">1 - Apto</option>
                  <option value="2">2 - Inapto</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Médico Responsável (CRM)</label>
                <input
                  type="text"
                  value={medicoCrm}
                  onChange={(e) => setMedicoCrm(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Exames Complementares Realizados</label>
              <input
                type="text"
                value={examesComplementares}
                onChange={(e) => setExamesComplementares(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
              />
            </div>
          </div>
        )}

        {/* 4. MÓDULO EVENTO S-2210 (CAT / ACIDENTES) */}
        {abaAtiva === "s2210" && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-800">
                  Evento S-2210 - Comunicação de Acidente de Trabalho (CAT)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Comunicação formal de acidente de trabalho, de trajeto ou doença profissional.
                </p>
              </div>
              <button
                onClick={downloadXmlS2210}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow transition flex items-center gap-1.5"
              >
                ⚡ Gerar & Baixar XML S-2210
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Tipo de Acidente</label>
                <select
                  value={tipoAcidente}
                  onChange={(e: any) => setTipoAcidente(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-semibold"
                >
                  <option value="1">1 - Típico</option>
                  <option value="2">2 - Trajeto</option>
                  <option value="3">3 - Doença Ocupacional</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Data do Ocorrido</label>
                <input
                  type="date"
                  value={dataAcidente}
                  onChange={(e) => setDataAcidente(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Horário do Acidente</label>
                <input
                  type="time"
                  value={horaAcidente}
                  onChange={(e) => setHoraAcidente(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Houve Afastamento?</label>
                <select
                  value={houveAfastamento ? "sim" : "nao"}
                  onChange={(e) => setHouveAfastamento(e.target.value === "sim")}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-semibold"
                >
                  <option value="nao">Não (Retorno às atividades)</option>
                  <option value="sim">Sim (Afastamento do trabalho)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Diagnóstico Médico Provável (CID-10)</label>
                <input
                  type="text"
                  value={cid10}
                  onChange={(e) => setCid10(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Parte do Corpo Atingida</label>
                <input
                  type="text"
                  value={parteCorpo}
                  onChange={(e) => setParteCorpo(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded text-xs"
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}