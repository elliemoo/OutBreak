import json
import re

KEY_SEARCH_TERMS = [
    "Outbreak",
    "Infection",
    "Fever",
    "Virus",
    "Epidemic",
    "Infectious",
    "Illness",
    "Bacteria",
    "Emerging",
    "Unknown virus",
    "disease",
    "Zika",
    "MERS",
    "Salmonella",
    "Legionnaire",
    "Measles",
    "Category A Agents",
    "Anthrax",
    "Botulism",
    "Plague",
    "Smallpox and other related pox viruses",
    "Tularemia",
    "Junin Fever",
    "Machupo Fever",
    "Guanarito Fever",
    "Chapare Fever",
    "Lassa Fever",
    "Lujo Fever",
]
DISEASE_TRANSLATIONS = {
    "Anthrax ": "antharax",
    "Avian Flu": "influenza a/h5n1",
    "Botulism": "botulism",
    "Brucellosis": "brucellosis",
    "Chikungunya": "chikungunya",
    "Cholera Outbreak": "cholera",
    "Congo Fever": "crimean-congo haemorrhagic fever",
    "Coronavirus": "COVID-19",
    "Dengue / Hemorrhagic Fever": "dengue",
    "Foot-And-Mouth Disease": "hand, foot and mouth disease",
    "H3N2 - Swine Flu / Canine Influenza": "influenza a/h3n2",
    "Hantavirus": "hantavirus",
    "Lassa Fever": "lassa fever",
    "Malaria": "malaria",
    "Monkey Pox": "monkeypox",
    "Nipah Virus": "nipah virus",
    "Plague": "plague",
    "Polio": "poliomyelitis",
    "Ebola / Marburg":"ebola haemorrhagic fever,marburg virus disease",
    "Q-Fever": "q fever",
    "Rabies": "rabies",
    "Rift Valley Fever": "rift valley fever",
    "Salmonella Outbreak (Suspected or Confirmed)": "salmonellosis",
    "Small Pox": "smallpox",
    "Swine Flu - Confirmed / Possible Related Death": "influenza a/h1n1",
    "Swine Flu - Confirmed Cases": "influenza a/h1n1",
    "Swine Flu - Suspected or Probable Cases": "influenza a/h1n1",
    "African Swine Fever / Swine Fever": "influenza a/h1n1",
    "Tularemia": "tularemia",
    "West Nile Virus (suspected or confirmed)": "west nile virus",
    "Zika": "zika",
    "Schmallenberg Virus": "other",
    "Newcastle Disease": "other",
    "Miscellaneous / Unknown Diseases or Illnesses": "unknown",
    "H7N9 / H5N1 / H5N2 / H7N1 / H7N3 / H7N7 / H5N8" : "influenza a/h7n9,influenza a/h5n1,influenza a/h5n2,influenza a/h7n1,influenza a/h7n3,influenza a/h7n7,influenza a/h5n8"
}

SYNDROME_LIST = [
    "Hhaemorrhagic Fever" ,
    "Acute Flacid Paralysis",
    "Acute gastroenteritis",
    "Acute respiratory syndrome",
    "Influenza-like illness",
    "Acute fever and rash",
    "Fever of unknown Origin",
    "Encephalitis",
    "Meningitis",
]

def get_diseases(string):
    try:
        output = string.replace(string,DISEASE_TRANSLATIONS[string])

    except Exception as e:
        output = string

    return output.split(",")

def get_syndromes(string):
    for syndrome in SYNDROME_LIST:
        if(re.search(syndrome,string,re.IGNORECASE)):
            return syndrome

def get_terms(string):
    for term in KEY_SEARCH_TERMS:
        if(re.search(term,string,re.IGNORECASE)):
            return term.lower()

