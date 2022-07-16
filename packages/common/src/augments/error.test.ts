import {extractMessage} from './error';

describe(extractMessage.name, () => {
    const message = 'this is a message';

    it('should extract the message from an error instance', () => {
        expect(extractMessage(new Error(message))).toBe(message);
    });

    it('should extract the message from a different type', () => {
        expect(extractMessage(message)).toBe(message);
        expect(extractMessage(1)).toBe('1');
    });

    it('should return empty string on nullish values', () => {
        expect(extractMessage(undefined)).toBe('');
        expect(extractMessage(null)).toBe('');
    });
});
