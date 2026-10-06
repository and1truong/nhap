#include "unikey.h"
#include <iostream>
#include <string>
#include <cstdlib>
#include <cctype>
void eraseUTF8(std::string& text, int n) {
  while(n-- > 0 && !text.empty()) { auto i=text.size()-1; while(i>0 && (static_cast<unsigned char>(text[i])&0xc0)==0x80) --i; text.resize(i); }
}
int main(int argc,char** argv) {
  if(argc!=4) return 2;
  UnikeySetup(); UnikeyOptions options{}; CreateDefaultUnikeyOptions(&options);
  options.spellCheckEnabled=std::atoi(argv[2]); options.autoNonVnRestore=std::atoi(argv[3]);
  options.freeMarking=1; options.modernStyle=0; options.macroEnabled=0;
  UnikeySetOptions(&options); std::string output;
  for(unsigned char c:std::string(argv[1])) {
    if(c>=128) return 3;
    if(c=='\n' || c=='\t') {UnikeyResetBuf(); output+=c; continue;}
    UnikeySetCapsState(std::isupper(c)!=0,0); UnikeyFilter(c);
    eraseUTF8(output,UnikeyBackspaces);
    if(UnikeyBufChars) output.append(reinterpret_cast<char*>(UnikeyBuf),UnikeyBufChars);
    else output+=c;
  }
  std::cout<<output; UnikeyCleanup();
}
