export const dataLanguage = {
  ar: {
    dir: 'rtl',
    languageName: 'العربية',
    home: {
      title: 'محرر ديسكورد',
      dialog: {
        title: 'مشروع جديد',
        form: {
          projectname: 'اسم المشروع',
          description: 'وصف المشروع',
          library: 'المكاتب الاضافية',
          token: 'التوكن',
          installing: 'جاري تثبيت التبعيات...',
          button: 'اضافة'
        }
      }
    },
    validation: {
      required: 'هذا الحقل مطلوب',
      invalidName: 'يجب أن يكون الاسم باللغة الإنجليزية بدون مسافات'
    }
  },
  en: {
    dir: 'ltr',
    languageName: 'English',
    home: {
      title: 'Discord IDE',
      dialog: {
        title: 'New Project',
        form: {
          projectname: 'Project Name',
          installing: 'Installing dependencies...',
          description: 'Project Description',
          library: 'Additional Libraries',
          token: 'Token',
          button: 'Add'
        }
      }
    },
    validation: {
      required: 'This field is required',
      invalidName: 'Name must be lowercase with hyphens only'
    }
  }
}
