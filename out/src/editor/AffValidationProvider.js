"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const DisposableBase_1 = require("../DisposableBase");
const $pureIntegerRegexp = /^[-]?\d+$/;
const $cmdCameraRegexp = /^camera\(([^)]+)\);$/;
const $cmdTimingRegexp = /^timing\(([^)]+)\);$/;
const $cmdFloorRegexp = /^\(([^)]+)\);$/;
const $cmdHoldRegexp = /^hold\(([^)]+)\);$/;
const $cmdArcRegexp = /^arc\(([^)]+)\)(?:\[([^\]]*)\])?;$/;
const $cmdArcTapRegexp = /^arctap\((\d+)\)$/;
class AffValidationProvider extends DisposableBase_1.default {
    constructor(context) {
        super();
        const diagCollection = vscode.languages.createDiagnosticCollection("arcaea-aff");
        this._diagCollection = diagCollection;
        context.subscriptions.push(diagCollection);
        vscode.workspace.onDidOpenTextDocument(this.__onDidOpenTextDocument, this);
        vscode.workspace.onDidChangeTextDocument(this.__onDidChangeTextDocument, this);
        vscode.workspace.onWillSaveTextDocument(this.__onWillSaveTextDocument, this);
        vscode.workspace.onDidSaveTextDocument(this.__onDidSaveTextDocument, this);
    }
    disposeInternal() {
        super.disposeInternal();
    }
    __onDidOpenTextDocument(e) {
        validateFile(e, this._diagCollection);
    }
    __onDidChangeTextDocument(e) {
        validateFile(e.document, this._diagCollection);
    }
    __onWillSaveTextDocument(e) {
        validateFile(e.document, this._diagCollection);
    }
    __onDidSaveTextDocument(e) {
        validateFile(e, this._diagCollection);
    }
}
exports.default = AffValidationProvider;
function validateFile(doc, diagCollection) {
    const diags = [];
    const lineCount = doc.lineCount;
    let lineCounter = 0;
    for (let i = 0; i < lineCount; ++i) {
        const line = doc.lineAt(i);
        if (line.isEmptyOrWhitespace) {
            continue;
        }
        if (lineCounter === 0) {
            checkMetadataAudioOffset(line);
        }
        else if (lineCounter === 1) {
            checkMetadataSeparator(line);
        }
        else if (lineCounter === 2) {
            checkCmdTiming(line, null, true);
        }
        else {
            checkCmd(line);
        }
        ++lineCounter;
    }
    diagCollection.set(doc.uri, diags);
    function checkMetadataAudioOffset(line) {
        const directive = "AudioOffset:";
        if (!line.text.startsWith(directive)) {
            pushDiagLine(line.range, "The first line should start with \"AudioOffset:\" directive.", vscode.DiagnosticSeverity.Error);
            return;
        }
        const audioOffsetStr = line.text.substr(directive.length);
        if (!$pureIntegerRegexp.test(audioOffsetStr)) {
            pushDiag(line.lineNumber, directive.length, line.lineNumber, line.text.length, `Invalid audio offset value: \"${audioOffsetStr}\". Expects integer.`, vscode.DiagnosticSeverity.Error);
            return;
        }
    }
    function checkMetadataSeparator(line) {
        const separator = "-";
        if (line.text !== separator) {
            pushDiagLine(line.range, `The second line should be \"${separator}\".`, vscode.DiagnosticSeverity.Error);
            return;
        }
    }
    function checkCmd(line) {
        const testText = line.text;
        let checked = false;
        if (testText.startsWith("(")) {
            checkCmdFloor(line, $cmdFloorRegexp.exec(testText));
            checked = true;
        }
        if (testText.startsWith("arc(")) {
            checkCmdArc(line, $cmdArcRegexp.exec(testText));
            checked = true;
        }
        if (testText.startsWith("hold(")) {
            checkCmdHold(line, $cmdHoldRegexp.exec(testText));
            checked = true;
        }
        if (testText.startsWith("timing(")) {
            checkCmdTiming(line, $cmdTimingRegexp.exec(testText), false);
            checked = true;
        }
        if (testText.startsWith("camera(")) {
            checkCmdCamera(line, $cmdCameraRegexp.exec(testText));
            checked = true;
        }
        if (!checked) {
            pushDiagLine(line.range, "Cannot recognize as an AFF command: " + testText, vscode.DiagnosticSeverity.Error);
        }
    }
    function checkCmdTiming(line, matches, recheck) {
        if (recheck) {
            if (!$cmdTimingRegexp.test(line.text)) {
                pushDiagLine(line.range, "Expects \"timing\" command.", vscode.DiagnosticSeverity.Error);
                return;
            }
            matches = $cmdTimingRegexp.exec(line.text);
        }
        if (matches === null) {
            pushDiagLine(line.range, "Invalid \"timing\" command. Did you miss \";\" at the end of line?", vscode.DiagnosticSeverity.Error);
            return;
        }
    }
    function checkCmdFloor(line, matches) {
        if (matches === null) {
            pushDiagLine(line.range, "Invalid floor note. Did you miss \";\" at the end of line?", vscode.DiagnosticSeverity.Error);
            return;
        }
    }
    function checkCmdHold(line, matches) {
        if (matches === null) {
            pushDiagLine(line.range, "Invalid \"hold\" command. Did you miss \";\" at the end of line?", vscode.DiagnosticSeverity.Error);
            return;
        }
    }
    function checkCmdArc(line, matches) {
        if (matches === null) {
            pushDiagLine(line.range, "Invalid \"arc\" command. Did you miss \";\" at the end of line?", vscode.DiagnosticSeverity.Error);
            return;
        }
        const arcTapContents = matches[2];
        if (arcTapContents !== null && arcTapContents !== undefined && arcTapContents.length > 0) {
            // We always starts at char 0 so the "0 + ..." can be ignored.
            const arcTapContentStartIndex = "arc()[".length + matches[1].length;
            const arcTapSegments = arcTapContents.split(",");
            let charIndexInArcTapContentText = 0;
            for (const segment of arcTapSegments) {
                if (!$cmdArcTapRegexp.test(segment)) {
                    const errorStartCharIndex = arcTapContentStartIndex + charIndexInArcTapContentText;
                    pushDiag(line.lineNumber, errorStartCharIndex, line.lineNumber, errorStartCharIndex + segment.length, "Expects \"arctap\" command.", vscode.DiagnosticSeverity.Error);
                }
                // Don't forget the ",".
                charIndexInArcTapContentText += segment.length + 1;
            }
        }
    }
    function checkCmdCamera(line, matches) {
        if (matches === null) {
            pushDiagLine(line.range, "Invalid \"camera\" command. Did you miss \";\" at the end of line?", vscode.DiagnosticSeverity.Error);
            return;
        }
    }
    function pushDiagLine(range, message, severity) {
        const diag = new vscode.Diagnostic(range, message, severity);
        diags.push(diag);
    }
    function pushDiag(startLine, startChar, endLine, endChar, message, severity) {
        const errorRange = new vscode.Range(startLine, startChar, endLine, endChar);
        const diag = new vscode.Diagnostic(errorRange, message, severity);
        diags.push(diag);
    }
}
//# sourceMappingURL=AffValidationProvider.js.map