// dllmain.cpp : Defines the entry point for the DLL application.
#include <iostream>
#include <string>
#include <fstream>
#include "pch.h"
#include <string>
#include "API/ARK/Ark.h"
#pragma comment(lib, "ArkApi.lib")

using namespace std;

DECLARE_HOOK(APrimalStructure_Die, bool, APrimalStructure*, float, FDamageEvent*, AController*, AActor*);
bool Hook_APrimalStructure_Die(APrimalStructure* _this, float KillingDamage, FDamageEvent* DamageEvent, AController* Killer, AActor* DamageCauser) {
    if (DamageCauser != nullptr && DamageCauser->IsA(AActor::GetPrivateStaticClass())) {
        const int teamId = DamageCauser->TargetingTeamField();
        const int targetTeamId = _this->TargetingTeamField();

        const FName targetName = _this->NameField();
        const FString targetNameString = targetName.ToString();

        ArkApi::GetApiUtils().SendChatMessageToAll("Destroyed", *targetNameString);


        cout << "Destroyed by: " << teamId << " | Target: " << targetTeamId << " | Structure: " << *targetNameString << endl;
        

    }

    return APrimalStructure_Die_original(_this, KillingDamage, DamageEvent, Killer, DamageCauser);
}



void LoadPlugin() {
    ArkApi::GetHooks().SetHook("APrimalStructure.Die", &Hook_APrimalStructure_Die, &APrimalStructure_Die_original);
}

void UnloadPlugin() {
    ArkApi::GetHooks().DisableHook("APrimalStructure.Die", &Hook_APrimalStructure_Die);
}


BOOL APIENTRY DllMain(HMODULE hModule, DWORD  ul_reason_for_call, LPVOID lpReserved) {
    switch (ul_reason_for_call) {
    case DLL_PROCESS_ATTACH:
        LoadPlugin();
        break;
    case DLL_PROCESS_DETACH:
        UnloadPlugin();
        break;
    }
    return TRUE;
}
