# Introduction #

Add your content here.


# Details #

Add your content here.  Format your content with:
  * Text in **bold** or _italic_
  * Headings, paragraphs, and lists
  * Automatic links to other wiki pages

# Finding Files #

To find all SGID files:
find / -xdev -type f -perm +g=s -print

To find all SUID files
find / -xdev -type f -perm +u=s -print

To find all Writable dirs:
find / -xdev -perm +o=w ! \( -type d -perm +o=t \) ! -type l -print