# 解决 vim 中文乱码问题

## 问题描述

Windows 下中文字符显示正常、且是 utf-8 编码的文本，上传到 Linux 环境后用 vim 打开发现中文字符都是乱码。

## 解决方案

打开 vim 配置文件：`/etc/vim/vimrc`（Ubuntu）或 `/etc/vimrc`（CentOS），末尾添加：

```bash
" Chinese language support
set fileencodings=utf-8,gb2312,gb18030,gbk,ucs-bom,cp936,latin1
set termencoding=utf-8
set fileformats=unix
set encoding=utf-8
set fileencoding=utf-8
```

说明：

* **set fileencodings**：设置 vim 支持的文件编码类项
  * vim 启动时会按照它所列出的字符编码逐一探测即将打开的文件的字符编码方式，并且将 fileencoding 设置为最终探测到的字符编码方式
  * 因此最好将 Unicode 编码方式放到这个列表的最前面，将拉丁语系编码方式 latin1 放到最后面
* **set termencoding**：设置 vim 所工作的终端（或者 Windows 的 Console 窗口）的字符编码方式
* **set fileformats**：设置文件格式为 unix 格式（主要是解决 dos 与 unix 换行符不同的问题）
* **set encoding**：设置 vim 内部使用的字符编码方式（包括 vim 的 buffer-缓冲区、菜单文本、消息文本等）
* **set fileencoding**：设置用 vim 编辑的文件保存时的编码方式（不管是否新文件都如此）

## 自定义 vimrc

vim 配置文件一般有两份，属于 root 的 `/etc/vim/vimrc` 和属于当前用户的 `~/.vimrc`，两者都可以配置 vim，而当两者配置信息有冲突时，以后者为准。

也就是我们可以在不影响全局配置的情况下，做一份自己习惯的 vim 个性化设置。

当前用户自身的 vim 配置文件预设不存在，需要手动建立，操作如下：

```bash
vim ~/.vimrc
```

参考配置如下（注意双引号 `"` 是注释符号，不要用错注释符号了）：

```bash
" vimrc配置文件内容如下:
 
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" 
" 一般设定 
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" 
" 设定默认解码 
set fenc=utf-8 
set fencs=utf-8,usc-bom,euc-jp,gb18030,gbk,gb2312,cp936 
 
" 不要使用vi的键盘模式，而是vim自己的 
set nocompatible 
 
" history文件中需要记录的行数 
set history=100 
 
" 在处理未保存或只读文件的时候，弹出确认 
set confirm 
 
" 与windows共享剪贴板 
set clipboard+=unnamed 
 
" 侦测文件类型 
filetype on 
 
" 智能补全
set completeopt=longest,menu
 
" 载入文件类型插件 
filetype plugin on 
 
" 为特定文件类型载入相关缩进文件 
filetype indent on 
 
" 保存全局变量 
set viminfo+=! 
 
" 带有如下符号的单词不要被换行分割 
set iskeyword+=_,$,@,%,#,- 
 
" 语法高亮 
syntax enable
syntax on 
 
" 高亮字符，让其不受100列限制 
:highlight OverLength ctermbg=red ctermfg=white guibg=red guifg=white 
:match OverLength '\%101v.*' 
 
" 状态行颜色 
highlight StatusLine guifg=SlateBlue guibg=Yellow 
highlight StatusLineNC guifg=Gray guibg=White 
 
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" 
" 文件设置 
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" 
" 不要备份文件（根据自己需要取舍） 
set nobackup 
 
" 不要生成swap文件，当buffer被丢弃的时候隐藏它 
setlocal noswapfile 
set bufhidden=hide 
 
" 字符间插入的像素行数目 
set linespace=0 
 
" 增强模式中的命令行自动完成操作 
set wildmenu 
 
" 在状态行上显示光标所在位置的行号和列号 
set ruler 
set rulerformat=%20(%2*%<%f%=\ %m%r\ %3l\ %c\ %p%%%) 
 
" 命令行（在状态行下）的高度，默认为1，这里是2 
set cmdheight=2 
 
" 使回格键（backspace）正常处理indent, eol, start等 
set backspace=2 
 
" 允许backspace和光标键跨越行边界 
set whichwrap+=<,>,h,l 
 
" 可以在buffer的任何地方使用鼠标（类似office中在工作区双击鼠标定位） 
set mouse=a 
set selection=exclusive 
set selectmode=mouse,key 
 
" 启动的时候不显示那个援助索马里儿童的提示 
set shortmess=atI 
 
" 通过使用: commands命令，告诉我们文件的哪一行被改变过 
set report=0 
 
" 不让vim发出讨厌的滴滴声 
set noerrorbells 
 
" 在被分割的窗口间显示空白，便于阅读 
set fillchars=vert:\ ,stl:\ ,stlnc:\ 
 
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" 
" 搜索和匹配 
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" 
" 高亮显示匹配的括号 
set showmatch 
 
" 匹配括号高亮的时间（单位是十分之一秒） 
set matchtime=5 
 
" 在搜索的时候忽略大小写 
set ignorecase 
 
" 不要高亮被搜索的句子（phrases） 
set nohlsearch 
 
" 在搜索时，输入的词句的逐字符高亮（类似firefox的搜索） 
set incsearch 
 
" 输入:set list命令是应该显示些啥？ 
set listchars=tab:\|\ ,trail:.,extends:>,precedes:<,eol:$ 
 
" 光标移动到buffer的顶部和底部时保持3行距离 
set scrolloff=3 
 
" 不要闪烁 
set novisualbell 
 
" 我的状态行显示的内容（包括文件类型和解码） 
set statusline=%F%m%r%h%w\[POS=%l,%v][%p%%]\%{strftime(\"%d/%m/%y\ -\ %H:%M\")} 
 
" 总是显示状态行 
set laststatus=2 
 
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" 
" 文本格式和排版 
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" 
" 自动格式化 
set formatoptions=tcrqn 
 
" 继承前一行的缩进方式，特别适用于多行注释 
set autoindent 
 
" 为C程序提供自动缩进 
set smartindent 
 
" 使用C样式的缩进 
set cindent 
 
" 制表符为4 
set tabstop=4 
 
" 统一缩进为4 
set softtabstop=4 
set shiftwidth=4 
 
" 不要用空格代替制表符 
set noexpandtab 
 
" 不要换行 
set nowrap 
 
" 在行和段开始处使用制表符 
set smarttab 
 
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" 
" CTags的设定 
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" 
" 按照名称排序 
let Tlist_Sort_Type = "name" 
 
" 在右侧显示窗口 
let Tlist_Use_Right_Window = 1 
 
" 压缩方式 
let Tlist_Compart_Format = 1 
 
" 如果只有一个buffer，kill窗口也kill掉buffer 
let Tlist_Exist_OnlyWindow = 1 
 
" 不要关闭其他文件的tags 
let Tlist_File_Fold_Auto_Close = 0 
 
" 不要显示折叠树 
let Tlist_Enable_Fold_Column = 0 
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" 新文件标题
"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
" 定义函数SetTitle，自动插入文件头 
func SetTitle() 
	" 如果文件类型为.sh文件 
	if &filetype == 'sh' 
		call setline(1, "##########################################################################") 
		call append(line("."), "# File Name: ".expand("%")) 
		call append(line(".")+1, "# Author: kadoop") 
		call append(line(".")+2, "# mail: kadoop@163.com") 
		call append(line(".")+3, "# Created Time: ".strftime("%c")) 
		call append(line(".")+4, "#########################################################################") 
		call append(line(".")+5, "#!/bin/zsh")
		call append(line(".")+6, "PATH=/home/edison/bin:/home/edison/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/work/tools/gcc-3.4.5-glibc-2.3.6/bin")
		call append(line(".")+7, "export PATH")
		call append(line(".")+8, "")
	else 
		call setline(1, "/*************************************************************************") 
		call append(line("."), "	> File Name: ".expand("%")) 
		call append(line(".")+1, "	> Author: kadoop") 
		call append(line(".")+2, "	> Mail: kadoop@163.com") 
		call append(line(".")+3, "	> Created Time: ".strftime("%c")) 
		call append(line(".")+4, " ************************************************************************/") 
		call append(line(".")+5, "")
	endif
	if &filetype == 'cpp'
		call append(line(".")+6, "#include<iostream>")
    	call append(line(".")+7, "using namespace std;")
		call append(line(".")+8, "")
	endif
	if &filetype == 'c'
		call append(line(".")+6, "#include<stdio.h>")
		call append(line(".")+7, "")
	endif
	"	if &filetype == 'java'
	"		call append(line(".")+6,"public class ".expand("%"))
	"		call append(line(".")+7,"")
	"	endif
	" 新建文件后，自动定位到文件末尾
	autocmd BufNewFile * normal G
endfunc
 
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" 
" Autocommands 
""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" 
" 只在下列文件类型被侦测到的时候显示行号，普通文本文件不显示 
 
if has("autocmd") 
autocmd FileType xml,html,c,cs,java,perl,shell,bash,cpp,python,vim,php,ruby set number 
autocmd FileType xml,html vmap <C-o> <ESC>'<i<!--<ESC>o<ESC>'>o--> 
autocmd FileType java,c,cpp,cs vmap <C-o> <ESC>'<o 
autocmd FileType html,text,php,vim,c,java,xml,bash,shell,perl,python setlocal textwidth=100 
" autocmd Filetype html,xml,xsl source $VIMRUNTIME/plugin/closetag.vim 
autocmd BufReadPost * 
\ if line("'\"") > 0 && line("'\"") <= line("$") | 
\ exe " normal g`\"" | 
\ endif 
endif "has("autocmd") 
 
" F5编译和运行C程序，F6编译和运行C++程序 
" 请注意，下述代码在windows下使用会报错 
" 需要去掉./这两个字符 
 
" C的编译和运行 
map <F5> :call CompileRunGcc()<CR> 
func! CompileRunGcc() 
exec "w" 
exec "!gcc % -o %<" 
exec "! ./%<" 
endfunc 
 
" C++的编译和运行 
map <F6> :call CompileRunGpp()<CR> 
func! CompileRunGpp() 
exec "w" 
exec "!g++ % -o %<" 
exec "! ./%<" 
endfunc 
 
" 能够漂亮地显示.NFO文件 
set encoding=utf-8 
function! SetFileEncodings(encodings) 
let b:myfileencodingsbak=&fileencodings 
let &fileencodings=a:encodings 
endfunction 
function! RestoreFileEncodings() 
let &fileencodings=b:myfileencodingsbak 
unlet b:myfileencodingsbak 
endfunction 
 
au BufReadPre *.nfo call SetFileEncodings('cp437')|set ambiwidth=single au BufReadPost *.nfo call RestoreFileEncodings() 
 
" 高亮显示普通txt文件（需要txt.vim脚本） 
au BufRead,BufNewFile * setfiletype txt 
 
" 用空格键来开关折叠 
" set foldenable 
" set foldmethod=manual 
" nnoremap <space> @=((foldclosed(line('.')) < 0) ? 'zc':'zo')<CR> 
 
" minibufexpl插件的一般设置 
let g:miniBufExplMapWindowNavVim = 1 
let g:miniBufExplMapWindowNavArrows = 1 
let g:miniBufExplMapCTabSwitchBufs = 1 
let g:miniBufExplModSelTarget = 1
" 配色方案
colorscheme desert
" Taglist 配置
let Tlist_Show_One_File=1
let Tlist_Exit_OnlyWindow=1
" winmanager 配置
map wm :WMToggle<cr>
let g:winManagerWindowLayout='FileExplorer|TagList'
" cscope 配置
if has("cscope")
   set csprg=/usr/bin/cscope
   set csto=0
   set cst
   set nocsverb
   " add any database in current directory
   if filereadable("cscope.out")
       cs add cscope.out
        " else add database pointed to by environment
   elseif $CSCOPE_DB != ""
       cs add $CSCOPE_DB
   endif
   set csverb
endif
 
" cscope  快捷键
nmap<leader>sa :csadd cscope.out<cr>
nmap<leader>ss :cs find s<C-R>=expand("<cword>")<cr><cr>
nmap<leader>sg :cs find g <C-R>=expand("<cword>")<cr><cr>
nmap<leader>sc :cs find c <C-R>=expand("<cword>")<cr><cr>
nmap<leader>st :cs find t <C-R>=expand("<cword>")<cr><cr>
nmap<leader>se :cs find e <C-R>=expand("<cword>")<cr><cr>
nmap<leader>sf :cs find f<C-R>=expand("<cfile>")<cr><cr>
nmap<leader>si :cs find i<C-R>=expand("<cfile>")<cr><cr>
nmap<leader>sd :cs find d <C-R>=expand("<cword>")<cr><cr>
" MiniBufExplorer  配置
let g:miniBufExplMapWindowNavVim = 1
let g:miniBufExplMapWindowNavArrows = 1
let g:miniBufExplMapCTabSwitchBufs = 1
let g:miniBufExplModSelTarget = 1 
" grep 配置
nnoremap<F4>  /<C-R>=expand("<cword>")<cr><cr>
nnoremap<F3>  ?<C-R>=expand("<cword>")<cr><cr>
nnoremap <silent> <leader><F3> :Grep<CR> 
nnoremap <silent> <leader><F4> :Rgrep<CR> 
" SuperTab
let g:SuperTabRetainCompletionType=2
let g:SuperTabDefaultCompletionType="<C-X><C-O>"
" gvim字体
" set guifont=Courier\ Regular\ 20
" line
se nu
 
""
nnoremap <silent> <F12> :A<cr>
```

## 临时调整 vim 配置

如果我们只是想临时的调整，可以直接在 vim 编辑的文件中，直接输入指令，当这个文件关闭，设置不会保存。

```bash
# 设定显示行号
:set nu

# 取消显示行号
:set nonu

# 就是 high light search（高亮度搜寻）
# 这个就是设定是否将搜寻的字符串反白的设定值，默认值是 hlsearch
:set hlsearch

# 对应的就是取消设置 hlsearch 
:set nohlsearch

# 就是自动缩排。取消缩排与同上，以下就不再写取消命令
:set autoindent

# 是否自动储存备份档，一般是 nobackup 的
# 如果设定 backup 的话，那么当你更动任何一个文件时，则源文件会被另存成一个档名为 filename~ 的文件
:set backup

# 右下角的一些状态栏说明
:set ruler

# 是否要显示 --INSERT-- 之类的字眼在左下角的状态栏
:set showmode

# 一般来说，如果我们按下 i 进入编辑模式后，可以利用退格键（backspace）来删除任意字符
# 但是某些发行版则不许如此，此时我们就可以通过该参数来设置
# 当 backspace 为 2 时，就是可以删除任意值；0 或 1 时，仅可删除刚刚输入的字符，而无法删除原本就已经存在的文字。
:set backspace=2

# 显示目前所有的环境参数设定值
:set all

# 显示与系统默认值不同的设定参数，一般来说就是你有自行变动过的设定参数
:set
```

## 参考资料

* [VIM中与编码有关的选项](https://blog.zengrong.net/post/vim-encoding/)
* [vimrc 常用配置项](https://www.cnblogs.com/littlesuns/p/9845386.html)

（完）
