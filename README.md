# tiHelper
tiHelper是一个基于Titanium的命令行程序，tiHelper封装了ti create 和 ti build命令，大大简化了Titanium module的开发调试过程，
	
## 应用场景

 - 同时创建Titanium的APP和Module；
 - 一个命令实现module的编译、module的解压到APP，运行APP。
 
## 运行环境
 - 操作系统:**win7及以上win32系统、macOS 10.9及以上**
 - node版本：**0.12.0以上**
 - Titanium编译运行需要的所有环境**（JAVA，Android SDK，NDK，ANT等）**

## 重要提示
    tiHelper是基于Titanium开发的脚手架，所以，使用tiHelper之前请先确保你的Titanium编译运行环境是正常的，否则，tihelper将无法正常工作。
 
## 安装
使用tihelper模块之前，你必须先安装这个模块到你电脑上，作为命令行程序使用，应该**全局安装**

```
npm install -g tihelper

```
## 用法
**tihelper**封装了**Titanium CLI**的**create**和**build**命令，用户在使用**tihelper**时，完全可以把他当成**titanium**的**CLI**来使用，只要把ti改成**tihelper**就OK了。

#### tihelper create
**tihelper create**是对**Titanium***的命令**ti create**的封装，当你在命令行输入**tihelper create**时，命令行会依次提示你输入 **工程名称（Project Name）**、**包名（App ID）**、**个人或公司网址（Your company/personal URL）**和**工程生成目录（Directory to place project）**，
	
	tihelper create和使用Titanium CLI的ti create的区别是： 
	1..不需要选择是要生成APP还是Module。tihelper create命令会帮你生成一个APP和Module，
	2.APP和Module之间会建立一个联系（通过conf.json记录两个工程的路径），这是下面要讲的tihelper build命令的基础。
	3.目录结构不一样。假如我们执行ti helper的时候，输入的Project Name为Test.那么生成的目录结构为：
	--Test
   	  --TestApp
   	  --TestModule
   	  --conf.json
   		
#### tihelper build
**tihelper build**是对**Titanium***的命令**ti build**的封装，这里，对命令行参数而言，只是做了一层代理，所以，**ti build**后面跟的所有命令行参数对**tihelper build** 一样适用。

	tihelper build封装了ti build的所有功能。执行tihelper build将完成以下3件事情(以前面提到的Test工程为例)：
	1.编译TestMoudle
	2.将第一步中编译生成的文件（xxx.zip(xxx取决于用户输入的App ID)）解压到TestAPP存放Module的路径下，
	3.根据tihelper build后面的参数运行APP（将demo跑到真机或模拟器中）
	
	


	



	
