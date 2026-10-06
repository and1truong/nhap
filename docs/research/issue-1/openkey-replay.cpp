#include "Engine.h"
#include <iostream>
#include <string>
#include <cstdlib>
#include <codecvt>
#include <locale>
int vLanguage=1,vInputType=0,vFreeMark=1,vCodeTable=0,vSwitchKeyStatus=0;
int vCheckSpelling=1,vUseModernOrthography=0,vQuickTelex=0,vRestoreIfWrongSpelling=1;
int vFixRecommendBrowser=0,vUseMacro=0,vUseMacroInEnglishMode=0,vAutoCapsMacro=0;
int vUseSmartSwitchKey=0,vUpperCaseFirstChar=0,vTempOffSpelling=0,vAllowConsonantZFWJ=0;
int vQuickStartConsonant=0,vQuickEndConsonant=0,vRememberCode=0,vOtherLanguage=0,vTempOffOpenKey=0;
int main(int argc,char** argv) {
  if(argc!=4) return 2;
  vCheckSpelling=std::atoi(argv[2]); vRestoreIfWrongSpelling=std::atoi(argv[3]);
  auto* state=static_cast<vKeyHookState*>(vKeyInit()); std::u16string output;
  for(unsigned char c:std::string(argv[1])) {
    if(c>=128) return 3;
    int key=-1, caps=0;
    if(c==' ') key=KEY_SPACE; else if(c=='\n') key=KEY_RETURN; else if(c=='\t') key=KEY_TAB;
    else for(unsigned k=0;k<128 && key<0;++k) for(int sh=0;sh<2;++sh)
      if(keyCodeToCharacter(k|(sh?CAPS_MASK:0))==c) {key=k;caps=sh;break;}
    if(key<0) {startNewSession(); output+=c;continue;}
    vKeyHandleEvent(Keyboard,KeyDown,key,caps,false);
    if(state->code==vWillProcess || state->code==vRestore || state->code==vRestoreAndStartNewSession) {
      if(state->backspaceCount>output.size()) return 4;
      output.resize(output.size()-state->backspaceCount);
      for(int i=state->newCharCount-1;i>=0;--i) {
        auto data=state->charData[i];
        output+=static_cast<char16_t>((data&(CHAR_CODE_MASK|PURE_CHARACTER_MASK))?(data&CHAR_MASK):keyCodeToCharacter(data));
      }
      if(state->code==vRestore || state->code==vRestoreAndStartNewSession) output+=c;
      if(state->code==vRestoreAndStartNewSession) startNewSession();
    } else output+=c;
  }
  std::wstring_convert<std::codecvt_utf8_utf16<char16_t>,char16_t> codec;
  std::cout<<codec.to_bytes(output);
}
