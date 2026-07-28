import io
import csv
import arabic_reshaper
import re
from js import window


lettersList = {
    0xfe8d: 0x627,
    0xfe83: 0x623,
    0xfeaf: 0x632,
    0xfbaa: 0x6be,
    0xfeed: 0x648,
    0xfeef: 0x649,
    0xfee5: 0x646,
    0xfead: 0x631,
    0xfec1: 0x637,
    0xfe93: 0x629,
    0xfe87: 0x625,
    0xfeb1: 0x633,
    0xfe8f: 0x628,
    0xfec9: 0x639,
    0xfe95: 0x62a,
    0xfee9: 0x647,
    0xfef1: 0x64a,
    0xfea9: 0x62f,
    0xfe80: 0x621,
    0xfe81: 0x622,
    0xfe99: 0x62b,
    0xfedd: 0x644,
    0xfe9d: 0x62c,
    0xfebd: 0x636,
    0xfed5: 0x642,
    0xfed9: 0x643,
    0xfee1: 0x645,
    0xfeab: 0x630,
    0xfed1: 0x641,
    0xfec5: 0x638,
    0xfea1: 0x62d,
    0xfeb9: 0x635,
    0xfe89: 0x626,
    0xfea5: 0x62e,
    0xfeb5: 0x634,
    0xfe85: 0x624,
    0xfecd: 0x63a,
    0xfb6a: 0x6a4,
    0xfb7a: 0x686,
    0xfbac: 0x6be
}

def is_arabic(text):
    return bool(re.search(r'[\u0600-\u06FF]', text))

def process_csv_data(csv_text):
    input_stream = io.StringIO(csv_text)
    
    header_line_1 = input_stream.readline()
    header_line_2 = input_stream.readline()
    
    reader = csv.reader(input_stream, delimiter='|')
    reshaped_sentences = []
    
    for row in reader:
        if len(row) > 3 and is_arabic(row[3]):
            reshaped = arabic_reshaper.reshape(row[3])

            row[3] = "".join(
                chr(lettersList.get(ord(c), ord(c)))
                for c in reshaped
            )

        reshaped_sentences.append(row)

    output_stream = io.StringIO()
    output_stream.write(header_line_1)
    output_stream.write(header_line_2)
    
    writer = csv.writer(output_stream, delimiter='|', quoting=csv.QUOTE_MINIMAL)
    writer.writerows(reshaped_sentences)
    
    return output_stream.getvalue()

window.processCSVFromPython = process_csv_data