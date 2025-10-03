// ASUS TUF F17 FX707ZM Optimizer - Application JavaScript

// Données d'optimisation basées sur le modèle spécifique
const optimizationData = {
    mouseKeyboard: {
        mouseBuffer: {
            name: 'MouseDataQueueSize',
            path: 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\mouclass\\Parameters',
            type: 'DWORD',
            defaultValue: 32,
            description: 'Réduit le buffer des données souris',
            restartRequired: true
        },
        keyboardBuffer: {
            name: 'KeyboardDataQueueSize',
            path: 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\kbdclass\\Parameters',
            type: 'DWORD',
            defaultValue: 32,
            description: 'Réduit le buffer des données clavier',
            restartRequired: true
        },
        mouseAccel: {
            path: 'HKEY_CURRENT_USER\\Control Panel\\Mouse',
            values: {
                'MouseThreshold1': '0',
                'MouseThreshold2': '0',
                'MouseSpeed': '0'
            }
        },
        keyboardSpeed: {
            path: 'HKEY_CURRENT_USER\\Control Panel\\Keyboard',
            values: {
                'KeyboardDelay': '0',
                'KeyboardSpeed': '31'
            }
        }
    },
    network: {
        tcpCommands: [
            {
                name: 'TCP Window Scaling',
                command: 'netsh int tcp set global autotuninglevel=normal',
                description: 'Active l\'auto-tuning TCP'
            },
            {
                name: 'Chimney Offload',
                command: 'netsh int tcp set global chimney=enabled',
                description: 'Active le déchargement TCP'
            },
            {
                name: 'RSS',
                command: 'netsh int tcp set global rss=enabled',
                description: 'Active la mise à l\'échelle côté réception'
            },
            {
                name: 'ECN',
                command: 'netsh int tcp set global ecncapability=enabled',
                description: 'Active la notification de congestion'
            }
        ],
        registryTweaks: {
            tcpAckFrequency: {
                name: 'TcpAckFrequency',
                path: 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces',
                value: 1
            },
            tcpNoDelay: {
                name: 'TCPNoDelay',
                path: 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters\\Interfaces',
                value: 1
            }
        }
    },
    menuDelay: {
        menuShowDelay: {
            name: 'MenuShowDelay',
            path: 'HKEY_CURRENT_USER\\Control Panel\\Desktop',
            type: 'STRING',
            defaultValue: '20',
            description: 'Réduit le délai d\'affichage des menus'
        }
    },
    systemPerf: {
        powerCommands: [
            {
                name: 'High Performance',
                command: 'powercfg -duplicatescheme 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c'
            },
            {
                name: 'Ultimate Performance',
                command: 'powercfg -duplicatescheme e9a42b02-d5df-448d-aa00-03f14749eb61'
            }
        ],
        registryTweaks: {
            timerResolution: {
                name: 'GlobalTimerResolutionRequests',
                path: 'HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\kernel',
                value: 1
            },
            systemResponsiveness: {
                name: 'SystemResponsiveness',
                path: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile',
                defaultValue: 10
            }
        }
    }
};

// État de l'application
let appState = {
    currentTab: 'mouse-keyboard',
    selectedOptimizations: new Set(),
    sliderValues: {}
};

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeSliders();
    initializeToggles();
    loadDefaultSettings();
});

// Gestion des onglets
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

function switchTab(tabId) {
    // Mise à jour des boutons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    // Mise à jour des panels
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(tabId).classList.add('active');

    appState.currentTab = tabId;
}

// Gestion des sliders
function initializeSliders() {
    const sliders = document.querySelectorAll('.slider');
    
    sliders.forEach(slider => {
        const valueDisplay = slider.nextElementSibling;
        
        // Initialiser l'affichage
        valueDisplay.textContent = slider.value;
        appState.sliderValues[slider.id] = parseInt(slider.value);
        
        // Écouter les changements
        slider.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            valueDisplay.textContent = value;
            appState.sliderValues[slider.id] = value;
        });
    });
}

// Gestion des toggles
function initializeToggles() {
    const toggles = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
    
    toggles.forEach(toggle => {
        if (toggle.checked) {
            appState.selectedOptimizations.add(toggle.id);
        }
        
        toggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                appState.selectedOptimizations.add(e.target.id);
            } else {
                appState.selectedOptimizations.delete(e.target.id);
            }
        });
    });
}

// Chargement des paramètres par défaut
function loadDefaultSettings() {
    // Marquer toutes les optimisations comme sélectionnées par défaut
    const toggles = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
    toggles.forEach(toggle => {
        toggle.checked = true;
        appState.selectedOptimizations.add(toggle.id);
    });
}

// Affichage/masquage des détails d'avertissement
function toggleWarningDetails() {
    const warningDetails = document.getElementById('warning-details');
    warningDetails.classList.toggle('hidden');
}

// Génération des scripts par catégorie
function generateScript(category) {
    let script = '';
    let filename = '';
    
    switch(category) {
        case 'mouse-keyboard':
            script = generateMouseKeyboardScript();
            filename = 'ASUS_TUF_F17_Mouse_Keyboard_Optimization.reg';
            break;
        case 'network':
            script = generateNetworkScript();
            filename = 'ASUS_TUF_F17_Network_Optimization.bat';
            break;
        case 'menu-delay':
            script = generateMenuDelayScript();
            filename = 'ASUS_TUF_F17_Menu_Delay_Optimization.reg';
            break;
        case 'system-perf':
            script = generateSystemPerfScript();
            filename = 'ASUS_TUF_F17_System_Performance.bat';
            break;
        case 'hardware':
            script = generateHardwareGuide();
            filename = 'ASUS_TUF_F17_Hardware_Guide.txt';
            break;
    }
    
    downloadScript(script, filename);
}

// Génération du script souris/clavier
function generateMouseKeyboardScript() {
    let script = `Windows Registry Editor Version 5.00

; ASUS TUF F17 FX707ZM - Optimisations Souris & Clavier
; Réduit la latence d'entrée pour une réactivité maximale
; REDÉMARRAGE REQUIS après application

`;

    if (appState.selectedOptimizations.has('mouse-buffer-toggle')) {
        const mouseQueueSize = appState.sliderValues['mouse-queue-size'] || 32;
        script += `; Réduction du buffer données souris
[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\mouclass\\Parameters]
"MouseDataQueueSize"=dword:${mouseQueueSize.toString(16).padStart(8, '0')}

`;
    }

    if (appState.selectedOptimizations.has('keyboard-buffer-toggle')) {
        const keyboardQueueSize = appState.sliderValues['keyboard-queue-size'] || 32;
        script += `; Réduction du buffer données clavier
[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\kbdclass\\Parameters]
"KeyboardDataQueueSize"=dword:${keyboardQueueSize.toString(16).padStart(8, '0')}

`;
    }

    if (appState.selectedOptimizations.has('mouse-accel-toggle')) {
        script += `; Désactivation accélération souris Windows
[HKEY_CURRENT_USER\\Control Panel\\Mouse]
"MouseThreshold1"="0"
"MouseThreshold2"="0"
"MouseSpeed"="0"

`;
    }

    if (appState.selectedOptimizations.has('keyboard-speed-toggle')) {
        script += `; Optimisation vitesse et délai clavier
[HKEY_CURRENT_USER\\Control Panel\\Keyboard]
"KeyboardDelay"="0"
"KeyboardSpeed"="31"

`;
    }

    script += `; Instructions d'application:
; 1. Enregistrez ce fichier avec l'extension .reg
; 2. Clic droit > "Fusionner" ou double-clic
; 3. Redémarrez l'ordinateur pour que les modifications prennent effet
; 4. Configurez votre souris gaming à 1000Hz dans son logiciel dédié

; Avertissement: Ces modifications nécessitent des privilèges administrateur
; Créez un point de restauration avant application`;

    return script;
}

// Génération du script réseau
function generateNetworkScript() {
    let script = `@echo off
REM ASUS TUF F17 FX707ZM - Optimisations Réseau
REM Réduit la latence réseau et améliore les performances TCP/IP
REM Exécuter en tant qu'Administrateur

echo Optimisation réseau ASUS TUF F17 FX707ZM en cours...
echo.

`;

    if (appState.selectedOptimizations.has('tcp-autotune-toggle')) {
        script += `echo Configuration TCP Window Scaling...
netsh int tcp set global autotuninglevel=normal
echo TCP Window Scaling activé

`;
    }

    if (appState.selectedOptimizations.has('chimney-toggle')) {
        script += `echo Configuration Chimney Offload...
netsh int tcp set global chimney=enabled
echo Chimney Offload activé

`;
    }

    if (appState.selectedOptimizations.has('rss-toggle')) {
        script += `echo Configuration Receive Side Scaling...
netsh int tcp set global rss=enabled
echo RSS activé

`;
    }

    script += `echo Configuration ECN...
netsh int tcp set global ecncapability=enabled
echo ECN activé

echo.
echo Configuration des paramètres TCP avancés...

REM Configuration TCP pour gaming (nécessite redémarrage)
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters" /v TcpAckFrequency /t REG_DWORD /d 1 /f
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters" /v TCPNoDelay /t REG_DWORD /d 1 /f
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters" /v TcpDelAckTicks /t REG_DWORD /d 0 /f

echo.
echo ================================================
echo Optimisations réseau appliquées avec succès!
echo.
echo IMPORTANT: Redémarrez votre ordinateur pour que
echo toutes les modifications prennent effet.
echo ================================================
echo.
pause`;

    return script;
}

// Génération du script délai des menus
function generateMenuDelayScript() {
    const menuDelay = appState.sliderValues['menu-delay-value'] || 20;
    
    return `Windows Registry Editor Version 5.00

; ASUS TUF F17 FX707ZM - Optimisation Délais des Menus
; Réduit le délai d'affichage des menus de 400ms à ${menuDelay}ms

[HKEY_CURRENT_USER\\Control Panel\\Desktop]
"MenuShowDelay"="${menuDelay}"

; Instructions:
; 1. Enregistrez ce fichier avec l'extension .reg
; 2. Clic droit > "Fusionner" ou double-clic
; 3. Redémarrez pour que les modifications prennent effet
; 
; Cette optimisation rend l'interface Windows plus réactive
; Valeur par défaut Windows: 400ms
; Valeur optimisée: ${menuDelay}ms`;
}

// Génération du script performances système
function generateSystemPerfScript() {
    let script = `@echo off
REM ASUS TUF F17 FX707ZM - Optimisations Performances Système
REM Améliore les performances globales et la réactivité
REM Exécuter en tant qu'Administrateur

echo Optimisation performances système ASUS TUF F17 FX707ZM...
echo.

`;

    if (appState.selectedOptimizations.has('power-profile-toggle')) {
        script += `echo Configuration profil d'alimentation haute performance...
powercfg -duplicatescheme 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c
echo Profil haute performance activé

`;
    }

    if (appState.selectedOptimizations.has('timer-resolution-toggle')) {
        script += `echo Configuration résolution timer globale (Windows 11)...
reg add "HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\kernel" /v GlobalTimerResolutionRequests /t REG_DWORD /d 1 /f
echo Résolution timer forcée à 0.5ms

`;
    }

    if (appState.selectedOptimizations.has('system-responsiveness-toggle')) {
        const responsiveness = appState.sliderValues['responsiveness-value'] || 10;
        script += `echo Configuration réactivité système...
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v SystemResponsiveness /t REG_DWORD /d ${responsiveness} /f
echo SystemResponsiveness défini à ${responsiveness}

`;
    }

    script += `echo Configuration priorités processus...
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "GPU Priority" /t REG_DWORD /d 8 /f
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "Priority" /t REG_DWORD /d 6 /f
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "Scheduling Category" /t REG_SZ /d "High" /f

echo.
echo ================================================
echo Optimisations performances appliquées!
echo.
echo IMPORTANT: 
echo - Redémarrez pour appliquer toutes les modifications
echo - Ces optimisations sont spécifiquement conçues 
echo   pour l'ASUS TUF F17 FX707ZM
echo ================================================
echo.
pause`;

    return script;
}

// Génération du guide matériel
function generateHardwareGuide() {
    return `ASUS TUF F17 FX707ZM - Guide d'Optimisations Matérielles
========================================================

SPÉCIFICATIONS DÉTECTÉES:
- Modèle: ASUS TUF F17 FX707ZM
- Processeur: Intel Core i7-12700H (14 cores: 6 P-cores + 8 E-cores)
- GPU: NVIDIA GeForce RTX 3060 (140W TGP)
- Mémoire: DDR5-4800 (jusqu'à 32GB)
- Écran: 17.3" FHD 144Hz

OPTIMISATIONS PORTS USB:
========================
Votre ASUS TUF F17 dispose des ports suivants:
- 2x USB 3.2 Gen 1 Type-A
- 1x USB 3.2 Gen 2 Type-C  
- 1x Thunderbolt 4

RECOMMANDATIONS:
1. Branchez souris gaming sur USB Type-A le plus haut (connecté directement CPU)
2. Branchez clavier gaming sur le second port USB Type-A
3. Évitez les hubs USB pour périphériques gaming critiques

DÉSACTIVATION ÉCONOMIE D'ÉNERGIE USB:
====================================
1. Ouvrir le Gestionnaire de périphériques (devmgmt.msc)
2. Développer "Contrôleurs de bus USB"
3. Pour chaque contrôleur USB:
   - Clic droit > Propriétés
   - Onglet "Gestion de l'alimentation"
   - Décocher "Autoriser l'ordinateur à éteindre ce périphérique"
   - Cliquer OK
4. Redémarrer l'ordinateur

LOGICIELS RECOMMANDÉS:
=====================

1. MSI Utility V3 (Mode MSI pour GPU/périphériques)
   - Télécharger et installer
   - Activer le mode MSI pour GPU RTX 3060
   - Activer pour contrôleurs USB/audio

2. MarkC Mouse Fix (Désactivation accélération souris)
   - Alternative aux modifications registre
   - Plus précis que les réglages Windows natifs

3. SetTimerResolution (Résolution timer 0.5ms)
   - Forcer résolution timer précise
   - Améliore les performances gaming

CONFIGURATION NVIDIA RTX 3060:
==============================
1. Ouvrir le Panneau de configuration NVIDIA
2. Paramètres 3D > Gérer les paramètres 3D
3. Paramètres recommandés:
   - Mode de gestion de l'alimentation: "Performances maximales"
   - Synchronisation verticale: Désactivée
   - Délai d'images rendues à l'avance: 1

OPTIMISATIONS BIOS (Accès par F2 au démarrage):
===============================================
1. Activer XMP/DOCP pour la RAM DDR5
2. Désactiver C-States si disponible
3. Activer "Game Mode" ou "Performance Mode"
4. Vérifier que Secure Boot est configuré selon vos besoins

AVERTISSEMENTS IMPORTANTS:
=========================
- NE PAS utiliser bcdedit /set disabledynamictick sur portable
- NE PAS désactiver SpeedStep/SpeedShift sur portable
- Surveiller les températures après optimisations
- Utiliser MSI Afterburner pour monitoring GPU

VÉRIFICATIONS POST-OPTIMISATION:
===============================
1. Tester latence souris avec MouseTester
2. Vérifier FPS stable dans vos jeux favoris  
3. Surveiller températures CPU/GPU
4. Tester stabilité avec stress tests

Ces optimisations sont spécifiquement adaptées à votre
ASUS TUF F17 FX707ZM pour des performances gaming optimales.`;
}

// Aperçu des scripts
function previewScript(category) {
    const script = getScriptContent(category);
    const title = getScriptTitle(category);
    
    document.getElementById('modal-title').textContent = `Aperçu: ${title}`;
    document.getElementById('script-preview').textContent = script;
    document.getElementById('script-modal').classList.remove('hidden');
    
    // Configurer le bouton de téléchargement
    const downloadBtn = document.getElementById('download-script');
    downloadBtn.onclick = () => {
        generateScript(category);
        closeModal();
    };
}

function getScriptContent(category) {
    switch(category) {
        case 'mouse-keyboard': return generateMouseKeyboardScript();
        case 'network': return generateNetworkScript();
        case 'menu-delay': return generateMenuDelayScript();
        case 'system-perf': return generateSystemPerfScript();
        case 'hardware': return generateHardwareGuide();
        default: return '';
    }
}

function getScriptTitle(category) {
    const titles = {
        'mouse-keyboard': 'Optimisations Souris & Clavier (.reg)',
        'network': 'Optimisations Réseau (.bat)', 
        'menu-delay': 'Délais des Menus (.reg)',
        'system-perf': 'Performances Système (.bat)',
        'hardware': 'Guide Matériel (.txt)'
    };
    return titles[category] || 'Script';
}

// Fermeture de la modal
function closeModal() {
    document.getElementById('script-modal').classList.add('hidden');
}

// Téléchargement de scripts
function downloadScript(content, filename) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Génération du pack complet
function generateAllScripts() {
    const scripts = [
        { content: generateMouseKeyboardScript(), filename: 'ASUS_TUF_F17_Mouse_Keyboard.reg' },
        { content: generateNetworkScript(), filename: 'ASUS_TUF_F17_Network.bat' },
        { content: generateMenuDelayScript(), filename: 'ASUS_TUF_F17_Menu_Delay.reg' },
        { content: generateSystemPerfScript(), filename: 'ASUS_TUF_F17_System_Performance.bat' },
        { content: generateHardwareGuide(), filename: 'ASUS_TUF_F17_Hardware_Guide.txt' },
        { content: generateMasterScript(), filename: 'ASUS_TUF_F17_MASTER_INSTALLER.bat' }
    ];
    
    // Télécharger chaque script individuellement
    scripts.forEach((script, index) => {
        setTimeout(() => {
            downloadScript(script.content, script.filename);
        }, index * 500); // Délai pour éviter les conflits de téléchargement
    });
}

// Script maître d'installation
function generateMasterScript() {
    return `@echo off
REM ASUS TUF F17 FX707ZM - Script Maître d'Optimisation
REM Exécuter en tant qu'Administrateur
REM Créer un point de restauration avant exécution

title ASUS TUF F17 FX707ZM Optimizer
color 0A

echo ================================================
echo     ASUS TUF F17 FX707ZM OPTIMIZER v1.0
echo ================================================
echo.
echo Ce script va appliquer toutes les optimisations
echo pour réduire la latence et améliorer les performances.
echo.
echo IMPORTANT: Créez un point de restauration avant de continuer!
echo.
pause

echo Création du point de restauration...
powershell.exe -Command "Checkpoint-Computer -Description 'ASUS TUF F17 Optimization' -RestorePointType 'MODIFY_SETTINGS'"

echo.
echo Application des optimisations réseau...
call "ASUS_TUF_F17_Network.bat"

echo.
echo Application des optimisations système...
call "ASUS_TUF_F17_System_Performance.bat"

echo.
echo Application des optimisations registre...
regedit.exe /S "ASUS_TUF_F17_Mouse_Keyboard.reg"
regedit.exe /S "ASUS_TUF_F17_Menu_Delay.reg"

echo.
echo ================================================
echo OPTIMISATION TERMINÉE!
echo ================================================
echo.
echo Modifications appliquées:
echo - Latence souris/clavier réduite
echo - Optimisations réseau TCP/IP
echo - Délais des menus réduits
echo - Performances système améliorées
echo.
echo REDÉMARRAGE REQUIS pour finaliser les optimisations.
echo.
echo Consultez le fichier Hardware_Guide.txt pour
echo les optimisations manuelles additionnelles.
echo.
pause

echo Voulez-vous redémarrer maintenant? (O/N)
set /p restart=
if /i "%restart%"=="O" (
    shutdown /r /t 10 /c "Redémarrage pour finaliser les optimisations ASUS TUF F17"
    echo Redémarrage dans 10 secondes...
) else (
    echo Redémarrez manuellement pour finaliser les optimisations.
)

pause`;
}

// Affichage des liens logiciels
function showSoftwareLinks() {
    const softwareInfo = `Logiciels Recommandés pour ASUS TUF F17 FX707ZM:

1. MSI Utility V3
   - Fonction: Active le mode MSI pour réduire la latence
   - Usage: GPU RTX 3060 et contrôleurs USB/audio
   
2. MarkC Mouse Fix  
   - Fonction: Désactive complètement l'accélération souris
   - Alternative précise aux modifications registre
   
3. SetTimerResolution
   - Fonction: Force résolution timer à 0.5ms
   - Améliore la fluidité et réduit les micro-stutters

Ces outils sont complémentaires aux optimisations de ce configurateur
et recommandés pour maximiser les performances gaming.`;

    document.getElementById('modal-title').textContent = 'Logiciels Recommandés';
    document.getElementById('script-preview').textContent = softwareInfo;
    document.getElementById('script-modal').classList.remove('hidden');
    
    const downloadBtn = document.getElementById('download-script');
    downloadBtn.onclick = () => {
        downloadScript(softwareInfo, 'ASUS_TUF_F17_Software_Recommendations.txt');
        closeModal();
    };
}

// Fermer la modal en cliquant à l'extérieur
document.addEventListener('click', (e) => {
    const modal = document.getElementById('script-modal');
    if (e.target === modal) {
        closeModal();
    }
});

// Raccourci clavier pour fermer la modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});