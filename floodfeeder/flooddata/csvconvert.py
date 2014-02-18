import csv, sys
import requests
import simplejson as json
import re
from multiprocessing.pool import Pool


p = re.compile('<P>Postcode <B>(.*?)</B> is <B>')

def augment(row):
    gridref=row[2]
    payload ={'p':gridref, 'f':'lookup'}
    r = requests.get("http://www.nearby.org.uk/coord.cgi", params=payload)
    print " looking up gridref" , gridref
    m = p.search(r.text).group(1)
    res = row + [m.encode('ascii','ignore')]
    print "row is now\n\t", res
    return res
    


def getRows():
    filename = 'masts.csv'
    with open(filename, 'rb') as f:
        reader = csv.reader(f)
        try:
            for row in reader:
                yield augment(row)
        except csv.Error as e:
                sys.exit('file %s, line %d: %s' % (filename, reader.line_num, e))


with open('postcodemasts.csv', 'wb') as f:
    writer = csv.writer(f)
    rows = getRows()
    writer.writerows(rows)

    



