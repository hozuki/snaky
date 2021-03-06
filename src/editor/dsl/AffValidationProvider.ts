import * as util from "util";
import * as vscode from "vscode";
import DisposableBase from "../../DisposableBase";
import ValidationHelper from "./ValidationHelper";
import ValidationMode from "./ValidationMode";

// Note: For regular expressions for numbers, we don't need "+", and don't care about string starting with "0"
// in this context.

const $reg = {
    whitespace: /[\s]/,

    integer: /^[-]?\d+$/,
    positiveInteger: /^\d+$/,
    floatingPoint: /^[-]?(?:\d+(?:[.]\d*)?|[.]\d+)$/,
    strictFloatingPoint: /^[-]?\d+[.]\d{2}$/,

    cmdCamera: /^camera\(([^)]+)\);$/,
    cmdTiming: /^timing\(([^)]+)\);$/,
    cmdFloor: /^\(([^)]+)\);$/,
    cmdHold: /^hold\(([^)]+)\);$/,
    cmdArc: /^arc\(([^)]+)\)(?:\[([^\]]*)\])?;$/,
    cmdArcTap: /^arctap\((\d+)\)$/
};

const $validTrackNumbers = [1, 2, 3, 4];
const $validArcColors = [0, 1];
const $validArcColorsNotSuggested = [2, 3];
const $validIsTraceValues = ["true", "false"];
const $validEasingFunctions = ["b", "s", "si", "so", "sisi", "siso", "sosi", "soso"];
const $validEasingFunctionsStr = $validEasingFunctions.join(", ");

type DebugParamInfo = { text: string, charStartIndex: number, charEndIndex: number };

export default class AffValidationProvider extends DisposableBase {

    constructor(context: vscode.ExtensionContext) {
        super();

        this._extensionContext = context;

        const diagCollection = vscode.languages.createDiagnosticCollection("arcaea-aff");

        this._diagCollection = diagCollection;
        context.subscriptions.push(diagCollection);

        vscode.workspace.onWillSaveTextDocument(this.__onWillSaveTextDocument, this);
    }

    protected disposeInternal(): void {
        super.disposeInternal();
    }

    private __onWillSaveTextDocument(e: vscode.TextDocumentWillSaveEvent): void {
        if (shouldValidate(e.document)) {
            validateFile(this._extensionContext, e.document, this._diagCollection);
        }
    }

    private readonly _extensionContext: vscode.ExtensionContext;
    private readonly _diagCollection: vscode.DiagnosticCollection;

}

function shouldValidate(doc: vscode.TextDocument): boolean {
    return doc.languageId === "arcaea-aff";
}

function validateFile(context: vscode.ExtensionContext, doc: vscode.TextDocument, diagCollection: vscode.DiagnosticCollection): void {
    const diags: vscode.Diagnostic[] = [];
    const validationMode = ValidationHelper.parseValidationMode(context.globalState.get("arcaea.snaky.validation.aff"));

    let severityError: vscode.DiagnosticSeverity, severityWarning: vscode.DiagnosticSeverity;

    switch (validationMode) {
        case ValidationMode.TreatAsError:
            severityError = vscode.DiagnosticSeverity.Error;
            severityWarning = vscode.DiagnosticSeverity.Error;
            break;
        default:
            severityError = vscode.DiagnosticSeverity.Error;
            severityWarning = vscode.DiagnosticSeverity.Warning;
            break;
    }

    const lineCount = doc.lineCount;

    let lineCounter = 0;

    for (let i = 0; i < lineCount; ++i) {
        const line = doc.lineAt(i);

        if (line.isEmptyOrWhitespace) {
            continue;
        }

        if (lineCounter === 0) {
            checkMetadataAudioOffset(line);
        } else if (lineCounter === 1) {
            checkMetadataSeparator(line);
        } else if (lineCounter === 2) {
            checkCmdTiming(line, null, true);
        } else {
            checkCmd(line);
        }

        ++lineCounter;
    }

    diagCollection.set(doc.uri, diags);

    function checkMetadataAudioOffset(line: vscode.TextLine): void {
        const directive = "AudioOffset:";

        if (!line.text.startsWith(directive)) {
            pushDiagLine(line, `The first line should start with \"${directive}\" directive.`, severityError);
            return;
        }

        const audioOffsetStr = line.text.substr(directive.length);

        if (!$reg.integer.test(audioOffsetStr.trimLeft())) {
            pushDiag(line.lineNumber, directive.length, line.text.length,
                `Invalid audio offset value: \"${audioOffsetStr}\". Expects integer.`, severityError);
            return;
        }

        if ($reg.whitespace.test(audioOffsetStr)) {
            pushDiag(line.lineNumber, directive.length, line.text.length,
                "AudioOffset value should not contain whitespace characters.", severityWarning);
            return;
        }
    }

    function checkMetadataSeparator(line: vscode.TextLine): void {
        const separator = "-";

        if (line.text !== separator) {
            pushDiagLine(line, `The second line should be \"${separator}\".`, severityError);
            return;
        }
    }

    function checkCmd(line: vscode.TextLine): void {
        const testText = line.text;

        let checked = false;

        if (testText.startsWith("(")) {
            checkCmdFloor(line, $reg.cmdFloor.exec(testText));
            checked = true;
        }

        if (testText.startsWith("arc(")) {
            checkCmdArc(line, $reg.cmdArc.exec(testText));
            checked = true;
        }

        if (testText.startsWith("hold(")) {
            checkCmdHold(line, $reg.cmdHold.exec(testText));
            checked = true;
        }

        if (testText.startsWith("timing(")) {
            checkCmdTiming(line, $reg.cmdTiming.exec(testText), false);
            checked = true;
        }

        if (testText.startsWith("camera(")) {
            checkCmdCamera(line, $reg.cmdCamera.exec(testText));
            checked = true;
        }

        if (!checked) {
            pushDiagLine(line, "Cannot recognize as an AFF command: " + testText, severityError);
        }
    }

    function checkCmdTiming(line: vscode.TextLine, matches: RegExpMatchArray | null, recheck: boolean): void {
        if (recheck) {
            if (!$reg.cmdTiming.test(line.text)) {
                pushDiagLine(line, "Expects \"timing\" command.", severityError);
                return;
            }

            matches = $reg.cmdTiming.exec(line.text);
        }

        if (util.isNullOrUndefined(matches) || matches.length !== 2) {
            pushDiagLine(line, "Invalid \"timing\" command. Did you miss \";\" at the end of line?", severityError);
            return;
        }
    }

    function checkCmdFloor(line: vscode.TextLine, matches: RegExpMatchArray | null): void {
        if (util.isNullOrUndefined(matches) || matches.length !== 2) {
            pushDiagLine(line, "Invalid floor note. Did you miss \";\" at the end of line?", severityError);
            return;
        }

        const contentString = matches[1];
        const segments = contentString.split(",");

        const charIndexStart = "(".length;

        if (segments.length !== 2) {
            pushDiag(line.lineNumber, charIndexStart, charIndexStart + contentString.length,
                "Floor note should have 2 parameters.", severityError);
            return;
        }

        const params = buildParamInfoList(segments, charIndexStart);

        if (!$reg.positiveInteger.test(params[0].text.trim())) {
            pushDiag(line.lineNumber, params[0].charStartIndex, params[0].charEndIndex,
                "Invalid parameter. Expects positive integer.", severityError);
        } else {
            warnIfParamContainsWhitespace(line, params[0]);
        }

        if (!$reg.positiveInteger.test(params[1].text.trim())) {
            pushDiag(line.lineNumber, params[1].charStartIndex, params[1].charEndIndex,
                "Invalid parameter. Expects positive integer.", severityError);
        } else {
            const trackNumber = Number.parseInt(params[1].text.trim());

            if ($validTrackNumbers.indexOf(trackNumber) < 0) {
                pushDiag(line.lineNumber, params[1].charStartIndex, params[1].charEndIndex,
                    `Invalid track number: ${trackNumber}, expects 1, 2, 3 or 4.`, severityError);
            } else {
                warnIfParamContainsWhitespace(line, params[1]);
            }
        }
    }

    function checkCmdHold(line: vscode.TextLine, matches: RegExpMatchArray | null): void {
        if (util.isNullOrUndefined(matches) || matches.length !== 2) {
            pushDiagLine(line, "Invalid \"hold\" command. Did you miss \";\" at the end of line?", severityError);
            return;
        }

        const contentString = matches[1];
        const segments = contentString.split(",");

        const charIndexStart = "hold(".length;

        if (segments.length !== 3) {
            pushDiag(line.lineNumber, charIndexStart, charIndexStart + contentString.length,
                "Hold note should have 3 parameters.", severityError);
            return;
        }

        const params = buildParamInfoList(segments, charIndexStart);

        if (!$reg.positiveInteger.test(params[0].text.trim())) {
            pushDiag(line.lineNumber, params[0].charStartIndex, params[0].charEndIndex,
                "Invalid parameter. Expects positive integer.", severityError);
        } else {
            warnIfParamContainsWhitespace(line, params[0]);
        }

        if (!$reg.positiveInteger.test(params[1].text.trim())) {
            pushDiag(line.lineNumber, params[1].charStartIndex, params[1].charEndIndex,
                "Invalid parameter. Expects positive integer.", severityError);
        } else {
            warnIfParamContainsWhitespace(line, params[1]);
        }

        const param1Value = Number.parseInt(params[0].text.trim());
        const param2Value = Number.parseInt(params[1].text.trim());

        if (param2Value <= param1Value) {
            // TODO: Maybe stricter, e.g. param2-parm1 > 10 msecs
            pushDiag(line.lineNumber, params[0].charStartIndex, params[1].charEndIndex,
                `Start time (${param1Value}) should be later than end time (${param2Value}).`, severityWarning);
        }

        if (!$reg.positiveInteger.test(params[2].text.trim())) {
            pushDiag(line.lineNumber, params[2].charStartIndex, params[2].charEndIndex,
                "Invalid parameter. Expects positive integer.", severityError);
        } else {
            const trackNumber = Number.parseInt(params[2].text.trim());

            if ($validTrackNumbers.indexOf(trackNumber) < 0) {
                pushDiag(line.lineNumber, params[2].charStartIndex, params[2].charEndIndex,
                    `Invalid track number: ${trackNumber}, expects 1, 2, 3 or 4.`, severityError);
            } else {
                warnIfParamContainsWhitespace(line, params[2]);
            }
        }
    }

    function checkCmdArc(line: vscode.TextLine, matches: RegExpMatchArray | null): void {
        if (util.isNullOrUndefined(matches) || (matches.length !== 2 && matches.length !== 3)) {
            pushDiagLine(line, "Invalid \"arc\" command. Did you miss \";\" at the end of line?", severityError);
            return;
        }

        const paramsCheckResult: {
            arcStartTime?: number | undefined;
            arcEndTime?: number | undefined;
            isTrace: boolean | undefined;
        } = {
            arcStartTime: undefined,
            arcEndTime: undefined,
            isTrace: undefined
        };

        checkParameters();
        checkArcTapNotes();

        function checkParameters(): void {
            if (util.isNullOrUndefined(matches)) {
                console.warn("Should not happen.");
                return;
            }

            const contentString = matches[1];
            const segments = contentString.split(",");

            const charIndexStart = "arc(".length;

            const params = buildParamInfoList(segments, charIndexStart);

            if (segments.length !== 10) {
                pushDiag(line.lineNumber, charIndexStart, charIndexStart + contentString.length,
                    "Arc note should have 10 parameters.", severityError);
                return;
            }

            if (!$reg.positiveInteger.test(params[0].text.trim())) {
                pushDiag(line.lineNumber, params[0].charStartIndex, params[0].charEndIndex,
                    "Invalid parameter. Expects positive integer.", severityError);
            } else {
                warnIfParamContainsWhitespace(line, params[0]);

                paramsCheckResult.arcStartTime = Number.parseInt(params[0].text.trim());
            }

            if (!$reg.positiveInteger.test(params[1].text.trim())) {
                pushDiag(line.lineNumber, params[1].charStartIndex, params[1].charEndIndex,
                    "Invalid parameter. Expects positive integer.", severityError);
            } else {
                warnIfParamContainsWhitespace(line, params[1]);

                paramsCheckResult.arcEndTime = Number.parseInt(params[1].text.trim());
            }

            if (!util.isUndefined(paramsCheckResult.arcStartTime) && !util.isUndefined(paramsCheckResult.arcEndTime)) {
                switch (validationMode) {
                    case ValidationMode.Normal:
                        if (paramsCheckResult.arcEndTime < paramsCheckResult.arcStartTime) {
                            pushDiag(line.lineNumber, params[0].charStartIndex, params[1].charEndIndex,
                                `Arc end time (${paramsCheckResult.arcEndTime}) should be no earlier than arc start time (${paramsCheckResult.arcStartTime}).`,
                                severityWarning);
                        }
                        break;
                    default:
                        if (paramsCheckResult.arcEndTime <= paramsCheckResult.arcStartTime) {
                            pushDiag(line.lineNumber, params[0].charStartIndex, params[1].charEndIndex,
                                `Arc end time (${paramsCheckResult.arcEndTime}) should be later than arc start time (${paramsCheckResult.arcStartTime}).`,
                                severityWarning);
                        }
                        break;
                }
            }

            if (!$reg.floatingPoint.test(params[2].text.trim())) {
                pushDiag(line.lineNumber, params[2].charStartIndex, params[2].charEndIndex,
                    "Invalid parameter. Expects floating point number.", severityError);
            } else {
                warnIfParamIsNotArcaeaFloatingPointNumber(line, params[2]);
                warnIfParamContainsWhitespace(line, params[2]);
                warnIfFloatParamIsOutOfRange(line, params[2], -0.5, 1.5);
            }

            if (!$reg.floatingPoint.test(params[3].text.trim())) {
                pushDiag(line.lineNumber, params[3].charStartIndex, params[3].charEndIndex,
                    "Invalid parameter. Expects floating point number.", severityError);
            } else {
                warnIfParamIsNotArcaeaFloatingPointNumber(line, params[3]);
                warnIfParamContainsWhitespace(line, params[3]);
                warnIfFloatParamIsOutOfRange(line, params[3], -0.5, 1.5);
            }

            {
                const easingFunction = params[4].text.trim();

                if ($validEasingFunctions.indexOf(easingFunction) < 0) {
                    pushDiag(line.lineNumber, params[4].charStartIndex, params[4].charEndIndex,
                        `Invalid easing function. It should be one of: ${$validEasingFunctionsStr}.`, severityError);
                } else {
                    warnIfParamContainsWhitespace(line, params[4]);
                }
            }

            if (!$reg.floatingPoint.test(params[5].text.trim())) {
                pushDiag(line.lineNumber, params[5].charStartIndex, params[5].charEndIndex,
                    "Invalid parameter. Expects floating point number.", severityError);
            } else {
                warnIfParamIsNotArcaeaFloatingPointNumber(line, params[5]);
                warnIfParamContainsWhitespace(line, params[5]);
                warnIfFloatParamIsOutOfRange(line, params[5], 0, 1);
            }

            if (!$reg.floatingPoint.test(params[6].text.trim())) {
                pushDiag(line.lineNumber, params[6].charStartIndex, params[6].charEndIndex,
                    "Invalid parameter. Expects floating point number.", severityError);
            } else {
                warnIfParamIsNotArcaeaFloatingPointNumber(line, params[6]);
                warnIfParamContainsWhitespace(line, params[6]);
                warnIfFloatParamIsOutOfRange(line, params[6], 0, 1);
            }

            if (!$reg.positiveInteger.test(params[7].text.trim())) {
                pushDiag(line.lineNumber, params[7].charStartIndex, params[7].charEndIndex,
                    "Invalid parameter. Expects positive integer.", severityError);
            } else {
                const arcColorValue = Number.parseInt(params[7].text.trim());

                let isArcColorValid = false;

                if ($validArcColors.indexOf(arcColorValue) >= 0) {
                    isArcColorValid = true;
                }

                if ($validArcColorsNotSuggested.indexOf(arcColorValue) >= 0) {
                    switch (validationMode) {
                        case ValidationMode.Normal:
                            break;
                        default:
                            pushDiag(line.lineNumber, params[7].charStartIndex, params[7].charEndIndex,
                                `The color (${arcColorValue}) is one of the extended colors. It does not guarantee compatibility.`,
                                severityWarning);
                    }

                    isArcColorValid = true;
                }

                if (isArcColorValid) {
                    warnIfParamContainsWhitespace(line, params[7]);
                } else {
                    pushDiag(line.lineNumber, params[7].charStartIndex, params[7].charEndIndex,
                        "Invalid color value. Expectes 0 (blue) or 1 (red).", severityError);
                }
            }

            {
                if (params[8].text.trim() !== "none") {
                    pushDiag(line.lineNumber, params[8].charStartIndex, params[8].charEndIndex,
                        "This field must be \"none\".", severityError);
                } else {
                    warnIfParamContainsWhitespace(line, params[8]);
                }
            }

            {
                if ($validIsTraceValues.indexOf(params[9].text.trim()) < 0) {
                    pushDiag(line.lineNumber, params[9].charStartIndex, params[9].charEndIndex,
                        "Invalid trace arc setting. It should be \"true\" or \"false\".", severityError);
                } else {
                    const isTraceArcStr = params[9].text.trim();

                    switch (isTraceArcStr) {
                        case "true":
                            paramsCheckResult.isTrace = true;
                            break;
                        case "false":
                            paramsCheckResult.isTrace = false;
                            break;
                    }

                    warnIfParamContainsWhitespace(line, params[9]);
                }
            }
        }

        function checkArcTapNotes(): void {
            if (util.isNullOrUndefined(matches)) {
                console.warn("Should not happen.");
                return;
            }

            const arcTapContents = matches[2];

            if (util.isNullOrUndefined(arcTapContents)) {
                return;
            }

            if (util.isUndefined(paramsCheckResult.isTrace) || paramsCheckResult.isTrace) {
                // We always starts at char 0 so the "0 + ..." can be ignored.
                const arcTapContentStartIndex = "arc()[".length + matches[1].length;
                const arcTapContentEndIndex = arcTapContentStartIndex + arcTapContents.length;

                if (arcTapContents.length > 0) {
                    const arcTapSegments = arcTapContents.split(",");

                    let charIndexInArcTapContentText = 0;

                    let lastArcTapHitTime: number | undefined = undefined;

                    for (const segment of arcTapSegments) {
                        let arcTapErrored = false;
                        const segmentTrimmed = segment.trim();

                        const arcTapSegmentCharStartIndex = arcTapContentStartIndex + charIndexInArcTapContentText;
                        const arcTapSegmentCharEndIndex = arcTapSegmentCharStartIndex + segment.length;

                        if (!segmentTrimmed.startsWith("arctap(")) {
                            pushDiag(line.lineNumber, arcTapSegmentCharStartIndex, arcTapSegmentCharEndIndex,
                                "Expects \"arctap\" command.", severityError);
                            arcTapErrored = true;
                        }

                        if (!arcTapErrored) {
                            const arcTapMatches = $reg.cmdArcTap.exec(segmentTrimmed);
                            let arcTapParamString: string | null = null;
                            let arcTapParamStringStartIndex = 0;
                            let arcTapParamStringEndIndex = 0;

                            if (util.isNullOrUndefined(arcTapMatches) || arcTapMatches.length !== 2) {
                                pushDiag(line.lineNumber, arcTapSegmentCharStartIndex, arcTapSegmentCharEndIndex,
                                    "Invalid \"arctap\" command.", severityError);
                                arcTapErrored = true;
                            } else {
                                arcTapParamString = arcTapMatches[1];
                                const arcTapCommandLeftWhitespaceCount = segment.length - segment.trimLeft().length;

                                arcTapParamStringStartIndex = arcTapSegmentCharStartIndex + arcTapCommandLeftWhitespaceCount + "arctap(".length;
                                arcTapParamStringEndIndex = arcTapParamStringStartIndex + arcTapParamString.length;

                                if (!$reg.positiveInteger.test(arcTapParamString)) {
                                    pushDiag(line.lineNumber, arcTapParamStringStartIndex, arcTapParamStringEndIndex,
                                        "Invalid parameter. Expects positive integer.", severityError);
                                    arcTapErrored = true;
                                }
                            }

                            if (!arcTapErrored) {
                                if ($reg.whitespace.test(segment)) {
                                    pushDiag(line.lineNumber, arcTapSegmentCharStartIndex, arcTapSegmentCharEndIndex,
                                        "\"arctap\" array should not contain whitespace characters.", severityWarning);
                                }
                            }

                            if (!arcTapErrored) {
                                if (!util.isNullOrUndefined(arcTapParamString)) {
                                    const arcTapParamValue = Number.parseInt(arcTapParamString);

                                    if (!util.isUndefined(paramsCheckResult.arcStartTime) &&
                                        !util.isUndefined(paramsCheckResult.arcEndTime) &&
                                        paramsCheckResult.arcStartTime < paramsCheckResult.arcEndTime) {
                                        if (arcTapParamValue < paramsCheckResult.arcStartTime || paramsCheckResult.arcEndTime < arcTapParamValue) {
                                            pushDiag(line.lineNumber, arcTapParamStringStartIndex, arcTapParamStringEndIndex,
                                                `Time of \"arctap\" (${arcTapParamValue}) may be invalid. It should be between ${paramsCheckResult.arcStartTime} and ${paramsCheckResult.arcEndTime}.`,
                                                severityWarning);
                                        }
                                    }

                                    if (!util.isUndefined(lastArcTapHitTime)) {
                                        if (arcTapParamValue <= lastArcTapHitTime) {
                                            pushDiag(line.lineNumber, arcTapParamStringStartIndex, arcTapParamStringEndIndex,
                                                `Time of \"arctap\" (${arcTapParamValue}) is less than last \"arctap\" (${lastArcTapHitTime}).`,
                                                severityWarning);
                                        }
                                    }

                                    lastArcTapHitTime = arcTapParamValue;
                                } else {
                                    console.warn("Should not happen.");
                                }
                            }
                        }

                        if (arcTapErrored) {
                            lastArcTapHitTime = undefined;
                        }

                        if (!arcTapErrored) {
                            if (segment.length > segmentTrimmed.length) {
                                pushDiag(line.lineNumber, arcTapSegmentCharStartIndex, arcTapSegmentCharEndIndex,
                                    "\"arctap\" command should not contain whitespace characters.", severityWarning);
                            }
                        }

                        // Don't forget the ",".
                        charIndexInArcTapContentText += segment.length + ",".length;
                    }
                } else {
                    switch (validationMode) {
                        case ValidationMode.Normal:
                            break;
                        default:
                            pushDiag(line.lineNumber, arcTapContentStartIndex, arcTapContentEndIndex,
                                "\"arctap\" array is empty.", severityWarning);
                            break;
                    }
                }
            } else {
                if (!util.isUndefined(paramsCheckResult.isTrace)) {
                    // Now: isTrace == false
                    switch (validationMode) {
                        case ValidationMode.Normal:
                            break;
                        default:
                            // Here, the range is from '[' to ']', which is different from above (inside arctap array).
                            const arcTapContentStartIndex = "arc()".length + matches[1].length;
                            const arcTapContentEndIndex = arcTapContentStartIndex + arcTapContents.length + "]".length;

                            pushDiag(line.lineNumber, arcTapContentStartIndex, arcTapContentEndIndex,
                                "\"arctap\" array appearing after playable arc (red or blue) will change it to trace arc (translucent gray).",
                                severityWarning);

                            break;
                    }
                }
            }
        }
    }

    function checkCmdCamera(line: vscode.TextLine, matches: RegExpMatchArray | null): void {
        if (util.isNullOrUndefined(matches) || matches.length !== 2) {
            pushDiagLine(line, "Invalid \"camera\" command. Did you miss \";\" at the end of line?", severityError);
            return;
        }
    }

    /**
     * Pushes a diagnostic message, whose range is a given value.
     * @param {"vscode".Range} range Given range.
     * @param {string} message Diagnostic message.
     * @param {"vscode".DiagnosticSeverity} severity Severity of the message.
     */
    function pushDiagRange(range: vscode.Range, message: string, severity: vscode.DiagnosticSeverity): void {
        const diag = new vscode.Diagnostic(range, message, severity);
        diags.push(diag);
    }

    /**
     * Pushes a diagnostic message, whose range is a given value.
     * @param {"vscode".TextLine} line The {@see "vscode".TextLine}.
     * @param {string} message Diagnostic message.
     * @param {"vscode".DiagnosticSeverity} severity Severity of the message.
     */
    function pushDiagLine(line: vscode.TextLine, message: string, severity: vscode.DiagnosticSeverity): void {
        pushDiagRange(line.range, message, severity);
    }

    /**
     * Pushes a diagnostic message, whose range is on one line.
     * @param {number} lineNumber Line number.
     * @param {number} startChar Start character index.
     * @param {number} endChar End character index.
     * @param {string} message Diagnostic message.
     * @param {"vscode".DiagnosticSeverity} severity Severity of the message.
     */
    function pushDiag(lineNumber: number, startChar: number, endChar: number, message: string, severity: vscode.DiagnosticSeverity): void {
        const errorRange = new vscode.Range(lineNumber, startChar, lineNumber, endChar);
        const diag = new vscode.Diagnostic(errorRange, message, severity);
        diags.push(diag);
    }

    function buildParamInfoList(segments: string[], segmentCharStartIndex: number): DebugParamInfo[] {
        const result: DebugParamInfo[] = [];
        let start = segmentCharStartIndex;

        for (const segment of segments) {
            const paramCharStart = start;
            const paramCharEnd = start + segment.length;
            const info: DebugParamInfo = {
                text: segment,
                charStartIndex: paramCharStart,
                charEndIndex: paramCharEnd
            };

            result.push(info);

            start = paramCharEnd + ",".length;
        }

        return result;
    }

    function warnIfParamContainsWhitespace(line: vscode.TextLine, param: DebugParamInfo): void {
        if ($reg.whitespace.test(param.text)) {
            pushDiag(line.lineNumber, param.charStartIndex, param.charEndIndex,
                "The parameter should not contain whitespace characters.", severityWarning);
        }
    }

    function warnIfParamIsNotArcaeaFloatingPointNumber(line: vscode.TextLine, param: DebugParamInfo): void {
        if (!$reg.strictFloatingPoint.test(param.text.trim())) {
            pushDiag(line.lineNumber, param.charStartIndex, param.charEndIndex,
                "The floating point value may not be recognized by Arcaea. It should be like \"123.45\" with strictly two decimals.",
                severityWarning);
        }
    }

    function warnIfFloatParamIsOutOfRange(line: vscode.TextLine, param: DebugParamInfo, min: number, max: number): void {
        const paramValue = Number.parseFloat(param.text);

        if (paramValue < min || max < paramValue) {
            pushDiag(line.lineNumber, param.charStartIndex, param.charEndIndex,
                `The parameter may be out of range. Its value should be between ${min} and ${max}.`, severityWarning);
        }
    }
}
