# Unity Project — Bolty's Puzzle Park (C#)

## Folder Structure (Unity 2022.3 LTS)

```
Assets/
  Scenes/
    Hub.unity
    ScrewGame.unity
    SortGame.unity
    ArrowGame.unity
  Scripts/
    Core/
      GameManager.cs
      SaveSystem.cs
      AudioManager.cs
      AdManager.cs
      IAPManager.cs
      FirebaseManager.cs
    Screw/
      ScrewBox.cs
      ScrewController.cs
      ScrewLevelGenerator.cs
    Sort/
      ConveyorController.cs
      TableController.cs
      CustomerManager.cs
    Arrow/
      MazeGenerator.cs
      ArrowController.cs
      KingController.cs
    UI/
      HubUI.cs
      LevelMapUI.cs
      ShopUI.cs
      ResultUI.cs
  Prefabs/
    Screw.prefab
    Box.prefab
    Plate.prefab
    Arrow.prefab
  Art/  (see /GameProject/assets)
  Audio/ (see /GameProject/audio)
  Plugins/
    GoogleMobileAds/
    GooglePlayBilling/
    Firebase/
Builds/
  Android/  (AAB output)
ProjectSettings/
  ProjectSettings.asset
```

## Key C# Scripts (Ready to Copy)

Example: `Assets/Scripts/Core/GameManager.cs`

```csharp
using UnityEngine;

public class GameManager : MonoBehaviour {
    public static GameManager I;
    public int coins, gems, hearts=5, xp;
    public string curWorld="screw"; public int curLevel=1;

    void Awake(){ if(I==null){ I=this; DontDestroyOnLoad(gameObject); Load(); } else Destroy(gameObject); }

    public void AddCoins(int v){ coins+=v; Save(); UIManager.I?.UpdateHub(); }
    public void Save(){ PlayerPrefs.SetString("bolty_save", JsonUtility.ToJson(this)); PlayerPrefs.Save(); FirebaseManager.Log("coins", coins); }
    public void Load(){ if(PlayerPrefs.HasKey("bolty_save")) JsonUtility.FromJsonOverwrite(PlayerPrefs.GetString("bolty_save"), this); }
    
    public void ShowRewarded(string placement, System.Action onReward){
        AdManager.I.ShowRewarded(placement, onReward);
    }
    public void ShowInterstitialIfAllowed(){
        if(Time.realtimeSinceStartup - AdManager.lastInterstitial > 180f){
            AdManager.I.ShowInterstitial();
            AdManager.lastInterstitial = Time.realtimeSinceStartup;
        }
    }
}
```

`Screw/ScrewLevelGenerator.cs` — generates 50 levels with S-curve difficulty.
`Sort/ConveyorController.cs` — drag-drop plates, check color match.
`Arrow/MazeGenerator.cs` — generates 5x5 to 9x9 mazes, ensures solvable path via BFS.

## Build Settings

- **Platform:** Android
- **Texture Compression:** ASTC (or ETC2 for fallback)
- **Min API:** 24 (Android 7.0), Target API 34
- **Scripting Backend:** IL2CPP, ARM64 + ARMv7
- **AAB:** Build → Build App Bundle (Google Play)
- **Keystore:** Create new keystore (see STEP 6 guide)
- **Size Target:** <60MB (strip engine code, compress audio to Vorbis 70%)

## Next: Godot Alternative

If using Godot 4 (GDScript), same folder structure with `scenes/` and `scripts/` — logic identical. Export to AAB via Godot Android export template.

See `../docs/STEP4_Development.md` for full build steps.
