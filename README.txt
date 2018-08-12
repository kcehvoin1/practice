# Run Instructions

  $ python game.py

# Troubleshooting

If you get the error below:
"""
  Traceback (most recent call last):
    File "game.py", line 21, in <module>
      import pygame
  ImportError: No module named 'pygame'
"""

Then you will have install the "pygame" Python module.

First figure out which Python version you are using...
In Git Bash: $ which python
If it's 3.* then use pip3.exe
If 2.* use pip2.exe

Generally, install Python deps in Git Bash via "pip2.exe install pygame" or "pip3.exe install pygame"



