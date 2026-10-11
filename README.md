# rtl-questions

מוד ל-Claude Code שמתקן את כיוון הטקסט בעברית באפליקציית הדסקטופ:

- **שאלות הבחירה של Claude (AskUserQuestion)** מוצגות בסדר נכון מימין לשמאל, גם כשיש בשאלה מילים באנגלית או מספרים. התשובה שנבחרת חוזרת ל-Claude בסדר המקורי.
- **אישור תוכנית במצב PLAN**: חלון האישור עצמו לא ניתן לשינוי על ידי מודים, אז כשהתוכנית נשלחת לאישור נפתחת לידו חלונית "תוכנית לאישור" עם התוכנית בסדר הנכון ומיושרת לימין. האישור עצמו נשאר בחלון הרגיל, והחלונית נסגרת אחריו.
- הפקודה `/rtl-plan` פותחת שוב את התוכנית האחרונה בחלונית.

בטרמינל שום דבר לא משתנה.

## התקנה

```
/plugin install rtl-questions --marketplace itaym967/rtl-questions
```

או מתיקייה מקומית:

```
claude plugin marketplace add <נתיב לתיקייה הזו>
claude plugin install rtl-questions@rtl-questions-marketplace --scope user
```
