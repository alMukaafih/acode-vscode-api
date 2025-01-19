/**
 * Represents an end of line character sequence in a {@link TextDocument document}.
 */
enum EndOfLine {
	/**
	 * The line feed `\n` character.
	 */
	LF = 1,
	/**
	 * The carriage return line feed `\r\n` sequence.
	 */
	CRLF = 2,
}

export default EndOfLine;
