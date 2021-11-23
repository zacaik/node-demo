import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState, useLayoutEffect } from 'react';
import styled from 'styled-components';
import { curryRight, last, stubFalse, uniq } from 'lodash-es';
import { Button, Checkbox, Tooltip } from 'antd';
import { XTerm } from '../xterm';
import 'xterm/css/xterm.css';
import { useDebounce } from 'react-use';
import { FitAddon } from 'xterm-addon-fit';
const StyledTerminal = styled.div`
    flex: 1;
    position: relative;
    height: 100%;
    padding: 16px;
    border-radius: 4px;
    background-color:rgb(40, 42, 54); 
    color: #fff;
    font-weight: 600;
    font-size: 14px;
    line-height: 22px;
    display: flex;
    flex-direction: column;
    width: 100%;
    overflow-x: auto;
    overflow-y: auto;
    .actions {
        padding: 0 0 16px;
        text-align: right;
        .ant-checkbox-wrapper {
            color: #fff;
        }
    }
    .line {
        display: flex;
        flex-direction: row;
    }
    .body {
        flex: 1;
        padding-right: 20px;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
    }
    .input-wrap {
        display: flex;
        flex-direction: row;
    }
    .input {
        flex: 1;
        /* height: 22px; */
        margin: 0 0 30px;
        padding: 0;
        outline: 0;
        border: none;
        background: transparent;
        font-weight: 600;
        color: inherit;
        resize: none;
    }
    .clear-btn {
        background-color: rgb(40, 42, 54);
        color: #fff;
        border: 1px solid #fff;
    }
    .prompt-label {
        color: #4ea24c;
        margin-right: 4px;
    }
    .running {
        display: inline-block;
        height: 14px;
        width: 0;
        border: 1px solid;
        margin-left: 12px;
        text-align: center;
        animation: terminal-rotate .8s linear infinite;
    }
    p, pre {
        margin-bottom: 0;
        word-break: break-all;
        white-space: pre-wrap;
        overflow: hidden;
        outline: 0;
        caret-color: transparent;
    }
    @keyframes terminal-rotate {
        100% { transform: rotate(360deg); }
    }
    .term-container {
        /* width: calc(65vw - 1vw * 10px); */
        /* display: flex;
        flex: 1 1 auto; */
        /* width: 90.625rem; */
        /* width: 63vw;
        height: 90vh; */
        overflow-x: auto;
        overflow-y: auto;
    }
`;
export interface TerminalHistoryItem {
    type: string;
    msg: string;
    prefix?: string;
}
export interface TerminalProps {
    mode?: 'oneline' | 'multiline';
    promptLabel?: React.ReactNode;
    style?: React.CSSProperties;
    terminalState?: TerminalState;
    onExec?: (cmd: string) => string | Promise<string>;
    onModeChange?: (mode: TerminalProps['mode']) => void;
    onStateChange?: (terminalState: TerminalState) => void;
    children?: React.ReactNode;
}
export interface TerminalState {
    sessionId?: string;
    prefix?: string;
    history: TerminalHistoryItem[];
    cmdHistory: string[];
    running: boolean;
    currentInput: string;
    execPromise?: Promise<string>;
    inputHistory: string[]; // 缓存当前指令下，用户的输入历史状态
}
export interface ServerTerminalRef {
    exec: (cmd: string, sessionId?: string) => void;
}
export interface Props {
    mode: 'oneline' | 'multiline';
    promptLabel?: React.ReactNode;
    style?: React.CSSProperties;
    terminalState?: TerminalState;
    onExec?: (cmd: string) => string | Promise<string>;
    onModeChange?: (mode: TerminalProps['mode']) => void;
    onStateChange?: (terminalState: TerminalState) => void;
    children?: React.ReactNode;
    ref: any;
}
export const XTerminal: React.FC<Props> = forwardRef<ServerTerminalRef>((props: TerminalProps, ref) => {
    const { style, mode, onModeChange } = props;
    // 当前控制台状态
    const [terminalState, setTerminalState] = useState<TerminalState>(props.terminalState!);
    const [res, setRes] = useState('');
    const [flag, setFlag] = useState(true); // 用来指示是否有新的执行结果出现
    const [isInput, setIsInput] = useState(true); // 用来表示缓冲区是否接受了新的输入
    const [isPasted, setIsPasted] = useState(false); // 用来
    const fitAddon = new FitAddon();
    const termRef = useRef<any>();
    const col = 164;
    // 服务器进程切换时，更新终端的内容
    useEffect(() => {
        setTerminalState(props.terminalState!);
        clear(); // 先清空终端
        showArrow();
        for (let i = 0; i < props.terminalState!.history.length; i++) {
            renderHistory(props.terminalState!.history[i]);
        }
        termRef.current.terminal.focus();
    }, [props.terminalState?.sessionId]);
    // 防抖获取当前缓冲区内用户的输入
    useDebounce(() => {
        const currentInput = getInput();
        const newHistory = [...terminalState.history];
        if (newHistory.length && last(terminalState.history)!.type === 'input') {
            newHistory[newHistory.length - 1] = { type: 'input', msg: currentInput };
        } else {
            newHistory.push({ type: 'input', msg: currentInput });
        }
        const newState = { ...terminalState, history: newHistory };
        setTerminalState(newState);
        props.onStateChange && props.onStateChange(newState);
    }, 500, [isInput]);
    useImperativeHandle(ref, () => ({
        exec: (cmd) => exec(cmd),
    }));
    useEffect(() => {
        // 这里只能根据flag来指示是否有新的结果出现
        // 如果依赖terminalState，则会拿不到最新的res
        // 如果依赖res，而因为res是字符串，当前后两次指令执行结果相等时，也不会触发
        resolveAsyncResult(terminalState.sessionId, res);
    }, [flag]);
    return <StyledTerminal>
        <div className="actions">
            <Tooltip title="勾选后：发送使用 Ctrl + Enter，上一条命令使用 Ctrl + ↑，下一条命令使用 Ctrl + ↓">
                <Checkbox
                    checked={mode === 'multiline'}
                    onChange={e => onModeChange && onModeChange(e.target.checked ? 'multiline' : 'oneline')}
                >多行模式</Checkbox>
            </Tooltip>
            <Button className="clear-btn" size="small" onClick={() => {
                clear(); // 清空控制台
                showArrow();
                emitChange(() => ({ history: [] })); // 清空历史记录
            }}
            >
                清空控制台
            </Button>
        </div>
        <div className="term-container">
            <XTerm
                options={{
                    rendererType: 'canvas', // 渲染类型
                    rows: 53, // 可视区域渲染的行数
                    cols: col,
                    convertEol: true, // 启用时，光标将设置为下一行的开头
                    scrollback: 20000, // 终端中的可回滚的行数
                    disableStdin: false, // 是否应禁用输入。
                    cursorStyle: 'block', // 光标样式
                    cursorBlink: true, // 光标闪烁
                    theme: {
                        foreground: 'rgb(233, 233, 231)', // 字体颜色
                        background: 'rgb(40, 42, 54)', // 背景色
                        cursor: 'rgb(233, 233, 231)', // 设置光标颜色
                        selection: 'rgba(189, 189, 189, 0.5)', // 选中区域的背景色
                    },
                }}
                onKey={(e) => onKey(e)}
                ref={termRef}
                addons={[fitAddon]} // 插件
                onData={(data) => handleInput(data)}
                customKeyEventHandler={(e: KeyboardEvent) => {
                    if ((e.key === 'c' || e.key === 'v') && e.ctrlKey) {
                        setIsPasted(true);
                        return false;
                    } 
                    setIsPasted(false);
                    return true;
                }}
            />
        </div>
    </StyledTerminal>;
    // 判断字符是否可打印显示
    function canshow (code: number) {
        if (
            (code >= 48 && code <= 57)
            || (code >= 65 && code <= 90)
            || code === 9
            || (code >= 96 && code <= 111)
            || (code >= 219 && code <= 222)
            || (code >= 186 && code <= 192)
            || code === 32
            || (code >= 37 && code <= 40)
        ) {
            return true;
        } else {
            return false;
        }
    }
    function onKey (e: {
        key: string;
        domEvent: KeyboardEvent;
    }) {
        const ev = e.domEvent;
        const printable = !ev.altKey
            && !ev.ctrlKey
            && !ev.metaKey
            && canshow(ev.keyCode);
        // 回退
        if (ev.ctrlKey && ev.key === 'z') {
            deleteCurrentInput();
            const newInputHistory = [...terminalState.inputHistory];
            newInputHistory.length && write(newInputHistory.pop() as string);
            const newState = { ...terminalState, inputHistory: newInputHistory };
            setTerminalState(newState);
            props.onStateChange && props.onStateChange(newState);
        } else {
            handleCache();
        }
        if (ev.keyCode === 13 && !ev.ctrlKey) {
            // 处理回车
            if (mode === 'multiline') {
                handleLineFeed(); // 多行模式下处理换行
            } else {
                // 单行模式下处理指令执行
                const input = getInput(); // 选择用户当前的输入
                if (input) {
                    exec(input, true);
                }
            }
        } else if (ev.keyCode === 8) {
            // 退格键的处理
            handleBackSpace();
        } else if (printable) {
            // 可打印键的处理，包括用于输入指令的键和方向键
            if (ev.keyCode < 37 || ev.keyCode > 40) {
                // 非方向键的处理
                // handlePrint(e);
            } else if (ev.keyCode === 37) {
                // 方向左键的处理
                // 对于方向左键，如果光标移动到了行的开头，就将其移动到上一行的末尾
                const y = getCursorY();
                const x = getCursorX();
                const lineStr = getLineStr(y).trimRight();
                const aboveLine = getLineStr(y - 1).trimRight();
                if (isFirstLine(lineStr) && x <= 3) {
                    return;
                }
                if (x <= 3) {
                    cursorUp(1);
                    cursorRight(aboveLine.length - 3); // 光标移动到上一行输入的末尾 每行开头空了3格所以要减3
                } else {
                    write(e.key);
                    if (lineStr.slice(x - 1, x)[0] && isChinese(lineStr.slice(x - 1, x)[0])) {
                        write(e.key);
                    }
                }
            } else if (ev.keyCode === 39) {
                // 方向右键的处理
                const y = getCursorY(); // 当前行的行数
                const x = getCursorX();
                const lineStr = getLineStr(y).trimRight();
                const length = lineStr.slice(x).length; // 当前行光标右面的内容的长度
                
                if (!length && (mode === 'multiline' || getLineStr(y + 1).trim())) {
                    // 如果length为0，说明光标已经到了末尾，如果此时是多行模式或者下一行有输入内容，则将光标向下移动
                    write('\n');
                    cursorRight(2); // 换行后光标向右移动到开头
                }
                write(e.key);
                if (lineStr.slice(x, x + 1)[0] && isChinese(lineStr.slice(x, x + 1)[0])) {
                    // 如果右边紧挨的字符是中文符号，则需要再移动一次，因为中文符由双字符号组成
                    write(e.key);
                }
            } else {
                // 上下方向键的处理
                if (mode === 'multiline' && !ev.ctrlKey) {
                    // 多行模式下处理光标的上下移动
                    let cursory = getCursorY();
                    const x = getCursorX();
                    const lineStr = getLineStr(cursory).trim(); // 获取换行时光标后面的输入
                    // 限制上方向键的向上移动
                    if (ev.keyCode === 38 && isFirstLine(lineStr)) {
                        return;
                    }
                    if (ev.keyCode === 38) {
                        write(e.key);
                        cursory--;
                    } else if (ev.keyCode === 40) {
                        write(e.key);
                        cursory++;
                    }
                    const aboveLine = getLineStr(cursory).trimRight(); // 上(下)一行的内容
                    if (!aboveLine.slice(x).length) {
                        // 如果上(下)一行位于光标右边的内容为空，则把光标移动到上(下)一行内容的末尾
                        cursorLeft(col); // 移动到左端
                        cursorRight(3);
                        cursorRight(aboveLine.length - 3); // 光标移动到上(下)一行输入的末尾
                    }
                } else if (mode === 'oneline') {
                    // 单行模式下处理缓存的历史指令
                    handleHistoryCmd(ev);
                }
            }
        }
        // 多行模式下处理指令执行
        if (mode === 'multiline' && ev.ctrlKey && ev.key === 'Enter') {
            const input = getInput(); // 选择用户当前的输入
            exec(input, true);
        }
        // 多行模式下处理指令历史缓存
        if (mode === 'multiline' && ev.ctrlKey && (ev.keyCode === 38 || ev.keyCode === 40)) {
            handleHistoryCmd(ev);
        }
    }
    async function exec (cmd: string, isIput?: boolean) {
        const { onExec } = props;
        // 如果指令不是用户手动输入的
        if (!isIput) {
            deleteCurrentInput(); // 先删除目前用户手动输入的指令
            write(cmd); // 如果用户是点击执行按钮执行指令，需要打印所执行的指令
        }
        const execPromise = onExec ? Promise.resolve(onExec(cmd)) : void 0;
        emitChange((prevState) => {
            return {
                execPromise,
                running: true,
                currentInput: '',
                history: [...prevState.history, { type: 'input', msg: cmd, prefix: prevState.prefix }]
            };
        });
        const result = onExec ? (await execPromise) : '&nbsp;';
        setRes(result ? result : '');
        setFlag(!flag); // flag的变化表示有新的指令被执行，从而触发resolveAsyncResult
        // resolveAsyncResult(terminalState.sessionId, result || ''); // 不能在这里进行结果处理，因为拿不到最新的terminalState
        let cursorY = getCursorY();
        moveCursorToBottom(cursorY, cursorY); // 将光标移动到最底部
        
        // 将结果输出到终端
        write('\n');
        write(result as string);
        write('\n');
        showArrow();
        termRef.current.terminal.focus();
        // 更新历史指令记录
        updateCmdHistory(cmd);
    }
    function emitChange (fn: (prevState: TerminalState) => Partial<TerminalState>) {
        setTerminalState((prevState) => {
            const newState = { ...prevState, ...fn(prevState) };
            const curCmd = last(newState.history);
            const prevCmd = last(prevState.history);
            // 记录历史命令，方便上下箭
            if (curCmd?.msg.trim()
                && curCmd.type === 'input'
                && !terminalState.cmdHistory.includes(curCmd.msg)
            ) {
                const newCmdHistory = [...newState.cmdHistory];
                if (prevCmd && prevCmd.type === 'input') {
                    if (!isPrevCmdExced(prevCmd.msg, terminalState)) {
                        // 如果之前输入指令没有被执行过，则需要将它覆盖
                        newCmdHistory[0] = curCmd.msg;
                    }
                    newState.history.splice(newState.history.length - 2, 1);
                } else {
                    newCmdHistory.unshift(curCmd.msg as string);
                }
                newState.cmdHistory = uniq(newCmdHistory);
            }
            props.onStateChange && props.onStateChange(newState);
            return { ...newState };
        });
    }
    function resolveAsyncResult (sessionId: string | undefined, result: string | undefined) {
        if (result === void 0) { return; }
        if (sessionId === terminalState.sessionId
            && last(terminalState.history)
            && last(terminalState.history)!.type !== 'output'
        ) {
            emitChange((prevState) => ({
                history: [...prevState.history, { type: 'output', msg: result }],
                running: false,
                execPromise: void 0
            }));
        }
    }
    // 删除当前输入指令
    function deleteCurrentInput () {
        let cursorY = getCursorY(); // 记录当前光标的y坐标
        cursorY = moveCursorToBottom(cursorY, cursorY);
        while (true) {
            const lineStr = getLineStr(cursorY);
            deleteLine(1);
            if (isFirstLine(lineStr)) {
                // 如果当前行内容包括箭头，则说明为起始行，删除已经完毕
                break;
            } else {
                // 反之光标向上移一行
                cursorUp(1);
                cursorY--;
            }
        }
        showArrow();
    }
    // 获取用户输入的指令
    function getInput () {
        const cursorY = getCursorY(); // 记录当前光标的y坐标
        let y = moveCursorToBottom(cursorY, cursorY);
        let res = '';
        // 光标边向上移边获取当前行的内容
        while (true) {
            const lineStr = getLineStr(y).trimRight();
            res = lineStr + '\n' + res; // 从后往前拼接
            if (isFirstLine(lineStr)) {
                // 如果当前行内容包括箭头，则说明为起始行，需要删除起始行的前三个字符
                res = res.slice(3);
                break;
            } else {
                // 反之光标向上移一行
                cursorUp(1);
                y--;
            }
        }
        
        // 光标复位 移动到最初的位置
        cursorDown(cursorY - y);
        // 最后结果需要删除掉最后的换行符
        return res.slice(0, res.length - 1).trimRight();
    }
    function renderHistory (historyItem: TerminalHistoryItem) {
        if (!historyItem) {
            return;
        }
        if (historyItem.type === 'input') {
            write(historyItem.msg);
        } else {
            write('\n');
            write(historyItem.msg);
            write('\n');
            showArrow();
        }
    }
    function clear () {
        termRef.current.terminal.clear(); 
        deleteLine(2);
    }
    // 更新历史指令记录
    function updateCmdHistory (cmd: string) {
        setTerminalState((prevState) => {
            const newState = { ...prevState };
            const newCmdHistory = [...newState.cmdHistory];
            newCmdHistory.unshift(cmd);
            newState.cmdHistory = uniq(newCmdHistory);
            props.onStateChange && props.onStateChange(newState);
            return { ...newState };
        });
    }
    // 控制历史指令缓存
    function handleHistoryCmd (ev: KeyboardEvent) {
        const currentInput = getInput();
        const newHistory = [...terminalState.history];
        const newCmdHistory = [...terminalState.cmdHistory];
        // 缓存当前输入的指令
        if (currentInput.trim() && !terminalState.cmdHistory.includes(currentInput)) {
            // 只有当前还没有被缓存的指令才能添加到缓存队列中
            newCmdHistory.unshift(currentInput);
        }
        // 求上一条或下一条指令
        const index = newCmdHistory.indexOf(currentInput);
        let nextIndex = ev.keyCode === 38 ? index + 1 : index - 1;
        if (nextIndex > -1 && nextIndex < newCmdHistory.length) {
            // 如果存在上条或下条指令
            deleteCurrentInput(); // 删除当前输入的指令    
            const nextInput = newCmdHistory[nextIndex].trim();
            write(nextInput);
            // 更新状态
            if (last(newHistory) && last(newHistory)!.type === 'input') {
                // 如果最后一条记录是输入，就用最新的指令覆盖这个输入
                newHistory[newHistory.length - 1] = { type: 'input', msg: nextInput };
            } else if (nextInput) {
                // 否则，在记录中添加最新输入的指令
                newHistory.push({ type: 'input', msg: nextInput });
            }
            const newState = { ...terminalState, currentInput: nextInput, history: newHistory, cmdHistory: newCmdHistory };
            emitChange(() => ({ ...newState }));
            setTerminalState(() => ({ ...newState }));
        } else if (nextIndex < 0 && index === 0) {
            // 如果不存在下条指令，则清空当前输入 
            deleteCurrentInput(); // 删除当前输入    
            const newState = {
                ...terminalState,
                history: newHistory,
                currentInput: '',
                cmdHistory: newCmdHistory,
            };
            setTerminalState(newState);    
        } 
    }
    function isPrevCmdExced (cmd: string, terminalState: TerminalState) {
        let nums = 0; // 记录cmd的个数
        for (let i = 0; i < terminalState.history.length; i++) {
            if (terminalState.history[i].msg === cmd && terminalState.history[i + 1] && terminalState.history[i + 1].type === 'output') {
                nums++;
            }
            if (nums > 1) {
                // 如果cmd的分数大于1，则说明该指令至少执行过一次
                return true;
            }
        }
        return false;
    }
    // 换行处理
    function handleLineFeed () {
        // 多行模式下回车需要处理内容：
        // 1.开辟新行
        // 2.将按下回车时，位于光标后面内容整体向下移动一行
        const cursory = getCursorY(); // 获取此时光标的y坐标
        const x = getCursorX();
        let lineStr = getLineStr(cursory, true).slice(x).trim(); // 获取换行时光标后面的输入
        deleteCharacter(lineStr.length); // 删除换行时光标后面的字符
        // 撤销掉中文字符的处理，还原成原字符串以输出
        lineStr = parseStr(lineStr);
        let res = deleteFollowingLines(cursory + 1, cursory); // 获取换行后几行的内容
        let lines = res.split('\n').length;
        if (res) {
            write('\n');
            cursorRight(3); // 开始空三格
            write(lineStr); // 写入数据
            cursorDown(1);
            cursorLeft(200); // 光标移回开头
            write(res); // 写入数据
            cursorLeft(200); // 光标移回开头
            cursorRight(3); // 开始空三格
            // 将光标复位
            cursorUp(lines);
        } else {
            write('\n');
            cursorLeft(200); // 光标移回开头
            cursorRight(3); // 开始空三格
            write(lineStr); // 写入数据
            cursorLeft(200); // 光标移回开头
            cursorRight(3); // 开始空三格
        }
        termRef.current.terminal.focus();     
    }
    // 退格处理
    function handleBackSpace () {
        const y = getCursorY();
        const x = getCursorX();
        const curLine = getLineStr(y);
        if (isFirstLine(curLine) && x <= 3) {
            return;
        }
        if (x > 3 && x <= col - 1) {
            // 当光标位于行中间时
            cursorLeft(1); // 光标先向左移动一格
            deleteCharacter(1); // 再删除
            if (isChinese(curLine.slice(x - 1, x)[0])) {
                // 如果待删除字符是中文字符，删除之后需要再将光标向左移动一格，并且删除多余的空白
                cursorLeft(1);
                deleteCharacter(1); // 删除多余的空白
            }
            if (mode === 'oneline') {
                // 单行模式下的删除字符后需要对各个行的内容进行调
                const res: string[] = []; // 获取下面所有行的内容
                let cursorY = y + 1;
                while (getLineStr(cursorY).trim()) {
                    res.push(getLineStr(cursorY).trim()); 
                    cursorY++;
                }
                if (res.length) {
                    cursorDown(1);
                    deleteLine(res.length); // 删除下面的所有行
                    cursorUp(1);
                    let deletedLine = curLine.slice(0, x - 1) + curLine.slice(x).trimRight(); // 删除字符后，当前行的内容
                    cursorRight(deletedLine.length); // 删除字符后,将光标移动到当前行的末尾
                    let leftLength = col - deletedLine.length - 1; // 当前行剩余可输入的长度
                    write(parseStr(res[0].slice(0, leftLength))); // 将下一行的首字符拼接到改行末尾
                    
                    // 如果下一行的长度大于leftLength，需要对下面所有行进行处理
                    // 即删除每一行的第一个字符，再把下一行的第一个字符拼接到上一行的末尾
                    if (res[0].length >= leftLength) {
                        for (let i = 0; i < res.length; i++) {
                            if (leftLength % 2 && isChinese(res[i][leftLength - 1])) {
                                res[i] = res[i].slice(leftLength - 1);
                            } else {
                                res[i] = res[i].slice(leftLength);
                            }
                            leftLength = col - 4 - res[i].length;
                            if (i < res.length - 1) {
                                if (leftLength % 2 && isChinese(res[i + 1][leftLength - 1])) {
                                    res[i] = res[i] + res[i + 1].slice(0, leftLength - 1);
                                } else {
                                    res[i] = res[i] + res[i + 1].slice(0, leftLength);
                                }
                            }
                            cursorDown(1);
                            cursorLeft(col);
                            cursorRight(3);
                            write(parseStr(res[i]));
                        }
                        // 光标复位
                        cursorUp(res.length); // 先向上移动到删除字符的那一行
                        cursorLeft(col);
                        cursorRight(x - 1);
                    }
                }
            }
        } else if (x <= 3 && y > 0) {
            // 当光标位于行开头时
            cursorUp(1);
            const length = getLineStr(y - 1).trimRight().length; // 上一行内容的长度
            cursorRight(length - 3); // 光标移动到上一行输入的末尾
            const lineStr = getLineStr(y, false).slice(3).trimRight(); // 当前行的内容
            const aboveLineStr = getLineStr(y - 1, false).trim(); // 上面一行的内容
            deleteLine(1); // 删除当前行。如果上一行有内容，那么这个指令也会导致上一行被清空
            // 删除当前行后，光标会移动到上一行的最左端
            if (!isFirstLine(aboveLineStr)) {
                cursorRight(3); // 如果上面一行不是起始行，则开头空三格
            } else {
                cursorRight(1); // 如果上面一行是起始行，则开头空一格
            }
            
            if (aboveLineStr) {
                write(aboveLineStr); // 将上面一行被清空的内容重新写出来
                
                if (lineStr) {
                    // 如果当前行有内容，需要将当前行拼接到上一行的末尾
                    const leftStrLength = isFirstLine(aboveLineStr) 
                        ? col - 2 - aboveLineStr.length 
                        : col - 4 - aboveLineStr.length; // 获取上一行还剩下的可输入区域的长度
                    if (leftStrLength < lineStr.length) {
                        write(lineStr.slice(0, leftStrLength));
                        cursorDown(1);
                        insertLine(1);
                        cursorRight(3);
                        write(lineStr.slice(leftStrLength));
                        // 光标复位
                        cursorUp(1);
                        cursorLeft(200); // 移动到最左端
                        isFirstLine(aboveLineStr) ? cursorRight(handleChinese(aboveLineStr).length + 1) : cursorRight(handleChinese(aboveLineStr).length + 3);
                    } else {
                        write(lineStr);
                        cursorLeft(handleChinese(lineStr).length); // 光标复位
                    }
                }
            }    
        }
    }
    // 判断当前行是否为起始行
    function isFirstLine (str: string) {
        return str.includes('>');
    }
    // 输入的处理
    function handleInput (data: string) {
        setIsInput(!isInput);
        if (data.charCodeAt(0) === 13 
            || data === '' // 退格
            || data === '\r' // 回车
            || data === '\u001b[D' // 上下左右四个方向键
            || data === '\u001b[A' 
            || data === '\u001b[B' 
            || data === '\u001b[C' 
            || data === '\u001a' // 使用ctrl + z时会输入这个转义字符序列
            || data === '\u001b[1;5A' // 使用ctrl + ↑时会输入这个转义字符序列
            || data === '\u001b[1;5B' // 使用ctrl + ↓时会输入这个转义字符序列
        ) {
            // 对上述特殊情况不做处理
            return;
        }
        console.log(data);
        if (isPasted) {
            handlePaste(data);
            return;
        }
        const x = getCursorX();
        const y = getCursorY();
        const curLineStr = getLineStr(y).trimRight();
        data = handleChinese(data);
        deleteCharacter(curLineStr.length - x); // 擦除光标右边的内容
        let rightStr = curLineStr.slice(x); // 被擦除部分的内容
        let leftLength = col - 1 - x; // 当前行剩余可输入的长度
        if (data.length < col - 1 - curLineStr.length) {
            // 如果当前行还有足够空间，则说明当前行不是当前输入的最后一行，不需要额外处理其他行
            write(parseStr(data));
            write(parseStr(rightStr));
            cursorRight(1);
            cursorLeft(rightStr.length + 1);
        } else {
            let index = y + 1;
            let nextLine = getLineStr(index).trim();
            if (data.length <= leftLength) {
                // 输入数据不用换行，rightStr可能需要换行的情况
                write(parseStr(data));
                leftLength = leftLength - data.length;
                const rightStrForInput = parseStr(rightStr.slice(0, leftLength)); 
                if (leftLength % 2 && isChinese(rightStr[leftLength - 1])) {
                    // 如果剩余可输入空间长度为奇数且待输入最后一个字符为汉字，parseStr之后，会把最后一个汉字字符给过滤掉，需要将这个汉字加到下一行上
                    rightStr = rightStr.slice(leftLength - 1); // 将最后一个汉字加到下一行上
                } else {
                    rightStr = rightStr.slice(leftLength);
                }
                write(rightStrForInput);
            } else {
                // 输入数据也需要换行的情况
                const dataForInput = parseStr(data.slice(0, leftLength));
                if (leftLength % 2 && isChinese(data[leftLength - 1])) {
                    // 如果剩余可输入空间长度为奇数且待输入最后一个字符为汉字，parseStr之后，会把最后一个汉字字符给过滤掉，需要将这个汉字加到下一行上
                    rightStr = data.slice(leftLength - 1) + rightStr; // 将最后一个汉字加到下一行上,rightStr就是要输出到下一行的内容
                } else {
                    rightStr = data.slice(leftLength) + rightStr;
                }
                write(dataForInput);
            }
            let prevStr = rightStr;
            while (nextLine || prevStr.length) {
                nextLine = prevStr + nextLine; // 下一行的内容
                prevStr = nextLine.slice(col - 4); // 由于下一行拼接了上一行掉下来的内容，所以需要裁减多余的部分
                write('\n'); 
                cursorRight(3);
                const nextLineForInput = parseStr(nextLine.slice(0, col - 4));
                write(nextLineForInput);
                index++;
                nextLine = getLineStr(index).trim();
            } 
            // 光标复位
            if (data.length <= col - 1 - x) {
                // 输入的内容没有发生换行的情况
                cursorUp(index - 1 - y);
                cursorLeft(col);
                cursorRight(x + data.length);
            } else {
                // 输入的内容发生了换行的情况
                cursorUp(index - 2 - y);
                cursorLeft(col);
                if (leftLength % 2 && isChinese(data[leftLength - 1])) {
                    cursorRight(3 + data.slice(leftLength - 1).length);
                } else {
                    cursorRight(3 + data.slice(leftLength).length);
                }
            }   
        }    
    }
    // 粘贴行为的处理
    function handlePaste (clipText: string) {
        clipText = handleChinese(clipText);
        const cursorY = getCursorY(); // 获取此时光标的y坐标
        const cursorX = getCursorX();
        const length = col - 4; // 终端每一行最多可容纳的字符数
        const lineStr = getLineStr(cursorY).slice(3).trim();
        const rightStr = lineStr.slice(cursorX - 3); // 光标右边的字符串
        const text = clipText;
        deleteCharacter(rightStr.length);
        let res = deleteFollowingLines(cursorY + 1, cursorY);
        let lines = res.split('\n').length;
        if (res) {
            // 如果当前行不是最后一行，需要调整光标的位置
            cursorRight(cursorX);
        }
        let pasteText = clipText.split('\r');
        let leftStrlength = length - lineStr.length + rightStr.length; // 当前行剩余可输入的字符数
        
        // 将粘贴内容的第一行拼接到此时光标的后面，并随着调整待粘贴的内容
        if (leftStrlength < pasteText[0].length) {
            write(parseStr(pasteText[0].slice(0, leftStrlength)));
            if (leftStrlength % 2 && isChinese(pasteText[0][leftStrlength - 1])) {
                // 如果剩余可输入空间长度为奇数且待输入最后一个字符为汉字，parseStr之后，会把最后一个汉字字符给过滤掉，需要将这个汉字加到下一行上
                pasteText[0] = pasteText[0].slice(leftStrlength - 1);
            } else {
                pasteText[0] = pasteText[0].slice(leftStrlength);
            }
        } else {
            write(parseStr(pasteText[0]));
            pasteText = pasteText.slice(1);
        }
        // 将粘贴的内容格式化，如果有一行的内容大于了终端最大长度，应该将它分为两行 
        for (let i = 0; i < pasteText.length; i++) {
            if (pasteText[i].length > length) {
                const temp = pasteText[i].slice(length);
                pasteText[i] = pasteText[i].slice(0, length);
                pasteText.splice(i + 1, 0, temp);
            }
        }
        // 写入粘贴的数据
        for (let i = 0; i < pasteText.length; i++) {
            write('\n');
            cursorRight(3);
            write(parseStr(pasteText[i]));
        }    
        leftStrlength = pasteText.length 
            ? length - pasteText[pasteText.length - 1].length 
            : length - cursorX + 3 - text.length; // 最后一行剩余可填写的长度
        // 写入rightStr
        if (rightStr.length < leftStrlength) {
            write(parseStr(rightStr));
            !res && cursorLeft(rightStr.length); // 光标复位
        } else {
            write(parseStr(rightStr.slice(0, leftStrlength)));
            write('\n');
            cursorRight(3);
            if (leftStrlength % 2 && isChinese(rightStr[leftStrlength - 1])) {
                // 如果剩余可输入空间长度为奇数且待输入最后一个字符为汉字，parseStr之后，会把最后一个汉字字符给过滤掉，需要将这个汉字加到下一行上
                write(parseStr(rightStr.slice(leftStrlength - 1)));
            } else {
                write(parseStr(rightStr.slice(leftStrlength)));
            }
            // 光标复位
            if (!res) {
                cursorUp(1);
                cursorLeft(col);
                cursorRight(3 + length - leftStrlength);
            }
        }
        // 恢复res
        if (res) {
            write('\n');
            write(res); // 写入数据
            cursorLeft(col); // 光标移回开头
            cursorRight(3); // 开始空三格
            // 将光标复位
            cursorUp(lines);
            if (rightStr.length > leftStrlength) {
                cursorUp(1);
            }
            if (pasteText.length) {
                // 如果输入内容发生了换行，pasteText的长度大于0
                cursorRight(pasteText[pasteText.length - 1].length);
            } else {
                cursorRight(cursorX - 3 + text.length);
            }
        }
    }    
    // 缓存当前指令的历史输入状态
    function handleCache () {
        const currentInput = getInput();
        const newInputHistory = [...terminalState.inputHistory, currentInput];
        const newState = { ...terminalState, inputHistory: newInputHistory };
        setTerminalState(newState);
        props.onStateChange && props.onStateChange(newState);
    }
    // 将光标移动到当前输入内容的最后一行
    // y是当前正在处理的行数，cursorY是最开始鼠标的y坐标
    // 返回最后一行的y坐标
    function moveCursorToBottom (y: number, cursorY: number) {
        while (y < termRef.current.terminal.buffer.active.length) {
            if (!getLineStr(y)) {
                // 如果当前行的内容获取为空，则说明光标到达底部
                break;
            }
            y++;
            cursorDown(1); //光标向下移动一行
        }
        // 光标已经越界，所以光标需要返回到最后一行输入上
        y--; // 之前的光标已经越界，需要回退一行
        while (true) {
            if (y === cursorY || getLineStr(y).trim() !== '') {
                // 如果当前行数等于换行时光标的y坐标，说明光标已经移动到了换行发生的那一行，并且发生换行的那一行是已输入指令的最后一行
                // 如果当前行的内容不为空，说明光标已经移动到了最后一行的输入上
                // 两种情况都表示光标返回到了最后一行的输入上
                break;
            }
            cursorUp(1);
            y--;
        }
        return y;
    }
    // 删除当前行下面的行，返回被删除的内容
    // y是当前正在处理的行数，cursorY是最开始鼠标的y坐标
    function deleteFollowingLines (y: number, cursorY: number) {
        let res = ''; // 获取换行后几行的内容
        y = moveCursorToBottom(y, cursorY); // 将鼠标移动到当前输入的最后一行
        
        // 获取下面几行的内容
        while (y > cursorY) {
            const lineStr = getLineStr(y, false).trimRight();
            res = lineStr + '\n' + res;
            deleteLine(1);
            cursorUp(1);
            y--;
        }
        return handleChinese(res);
    }
    // 向终端写内容
    function write (input: string) {
        termRef.current.terminal.write(input);
    }
    // 初始化箭头
    function showArrow () {
        write('\x1b[1;38;2;8;161;233;233;231;0m > \x1b[0m');
    }
    // 光标向上移动
    function cursorUp (n: number = 1) {
        if (n === 0) {
            return;
        }
        write(`\x1b[${n}A`);
    }
    // 光标向下移动
    function cursorDown (n: number = 1) {
        n && write(`\x1b[${n}B`); // 如果n等于0，不进行任何操作
    }
    // 光标向右移动
    function cursorRight (n: number = 1) {
        write(`\x1b[${n}C`);
    }
    // 光标向左移动
    function cursorLeft (n: number = 1) {
        if (n === 0) {
            return;
        }
        write(`\x1b[${n}D`);
    }
    // 插入空格
    function insertBlank (n: number = 1) {
        write(`\x1b[${n}\@`);
    }
    // 删除光标所在行
    function deleteLine (n: number = 1) {
        write(`\x1b[${n}M`);
    }
    function insertLine (n: number = 1) {
        write(`\x1b[${n}L`);
    }
    // 删除光标位置的字符
    function deleteCharacter (n: number = 1) {
        write(`\x1b[${n}P`);
    }
    // 获取此时光标的y坐标
    function getCursorY () {
        return termRef.current.terminal.buffer.active.cursorY + termRef.current.terminal.buffer.active.baseY;
    }
    // 获取光标的x坐标
    function getCursorX () {
        return termRef.current.terminal.buffer.active.cursorX;
    }
    
    // 获取指定行的内容
    function getLineStr (n: number, flag: boolean = true) {
        const line = termRef.current.terminal.buffer.active.getLine(n);
        if (line) {
            // flag表示是否对中文符进行特殊处理
            return flag ? handleChinese(line.translateToString()) : line.translateToString();
        } else {
            return '';
        }
    }
    // 将获取的字符串的汉字进行特殊处理，兼容终端的特性
    function handleChinese (lineStr: string) {
        // 终端将一个汉字按照两个字符进行处理，而JavaScript字符串将汉字按照一个字符来处理
        // 所以需要将字符串中的每个汉字重复一次
        for (let i = 0; i < lineStr.length; i++) {
            if (isChinese(lineStr[i])) {
                lineStr = lineStr.slice(0, i) + lineStr[i] + lineStr.slice(i);
                i++;
            }
        }
        return lineStr;
    }
    function parseStr (lineStr: string) {
        for (let i = 0; i < lineStr.length; i++) {
            if (isChinese(lineStr[i])) {
                lineStr = lineStr.slice(0, i) + lineStr.slice(i + 1);
            }
        }
        return lineStr;
    }
    // 判断一个字符是否占两个符号位
    function isChinese (c: string) {
        if (c === '‘' || c === '’' || c === '|' || c === '↑' || c === '↓') {
            // 特殊情况 上述中文标点符号只占一个符号位
            return false;
        }
        const reg = /[\u3002|\uff1f|\uff01|\uff0c|\u3001|\uff1b|\uff1a|\u2018|\u2019|\uff08|\uff09|\u300a|\u300b|\u3008|\u3009|\u3010|\u3011|\u300e|\u300f|\u300c|\u300d|\ufe43|\ufe44|\u3014|\u3015|\u2026|\u2014|\uff5e|\ufe4f|\uffe5]/;       
        return c.charCodeAt(0) > 256 || reg.test(c);
    }
});