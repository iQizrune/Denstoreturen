import { addCoat, hasCoat, getItems } from '@/components/bag/bagStore';

describe('bagStore coats', () => {
  it('adds coat once per city', () => {
    const city = 'mandal';
    const before = getItems().length;
    const first = addCoat(city);
    const afterFirst = getItems().length;
    const second = addCoat(city);
    const afterSecond = getItems().length;

    expect(first).toBe(true);
    expect(afterFirst).toBe(before + 1);
    expect(second).toBe(false);
    expect(afterSecond).toBe(afterFirst);
    expect(hasCoat(city)).toBe(true);
  });
});
