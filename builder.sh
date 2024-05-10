#!/bin/bash

# demo builder (c) 2019-2024 mborik/SinDiKat
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Utils required in PATH to successful build:
# latest `sjasmplus` from https://github.com/z00m128/sjasmplus
# `zx0` from https://github.com/einar-saukas/ZX0

ASM="sjasmplus"
OUTPUT="INFERNO.tap"

function ASM() {
	FULLPATH=$(realpath $1)
	shift
	sjasmplus --nologo --fullpath --color=off --msg=war $FULLPATH $@
}
function PAK() {
	rm -f $2
	zx0 -f $1 &> /dev/null
	mv -f "$1.zx0" $2
}

cd build
rm -f ${OUTPUT}

# Every part is compiled using this cmds pattern:
#
#> cd ../part
#> ASM part.a80 -DisFX --lst=part.lst
#> PAK final.bin final.pak

cd ../main
ASM main.a80 -DisFX --lst=main.lst --exp=constants.inc
PAK final.bin final.pak

cd ../level1
ASM level1.a80 -DisFX --lst=level1.lst
PAK final.bin final.pak
PAK loading.scr loading.pak
PAK music.stc music.pak

cd ../level2
ASM level2.a80 -DisFX --lst=level2.lst
PAK final.bin final.pak
PAK loading.scr loading.pak
PAK music.stc music.pak

cd ../level3
ASM level3.a80 -DisFX --lst=level3.lst
PAK final.bin final.pak
PAK loading.scr loading.pak
PAK music.stc music.pak

cd ../level4
ASM level4.a80 -DisFX --lst=level4.lst
PAK final.bin final.pak
PAK loading.scr loading.pak
PAK music.stc music.pak

cd ../level5
ASM level5.a80 -DisFX --lst=level5.lst
PAK final.bin final.pak
PAK loading.scr loading.pak
PAK music.stc music.pak

cd ../level6
ASM level6.a80 -DisFX --lst=level6.lst
PAK final.bin final.pak
PAK loading.scr loading.pak
PAK music.stc music.pak

cd ../outro
# ASM outro.a80 -DisFX --lst=outro.lst
PAK final.bin final.pak

# banks composition
cd ..
rm -f bank*
ASM pg0.a80 --lst=main/pg0.lst --exp=main/pg0.inc
ASM pg1.a80 --lst=main/pg1.lst --exp=main/pg1.inc
PAK bank1 bank1.pak
ASM pg3.a80 --lst=main/pg3.lst --exp=main/pg3.inc
PAK bank3 bank3.pak
ASM pg4.a80 --lst=main/pg4.lst --exp=main/pg4.inc
PAK bank4 bank4.pak
ASM pg6.a80 --lst=main/pg6.lst --exp=main/pg6.inc
PAK bank6 bank6.pak
ASM pg7.a80 --lst=main/pg7.lst --exp=main/pg7.inc
PAK bank7 bank7.pak

cd loader
PAK screen.scr screen.pak
ASM loader.a80 -DOUTPUT="\"../build/${OUTPUT}\"" --lst=loader.lst
