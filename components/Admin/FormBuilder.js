import { useState } from 'react';
import { useRouter } from 'next/router';

export default function FormBuilder({
    fields = [],
    initialValues = {},
    onSubmit,
    title,
    submitButtonText = '保存',
    cancelHref,
    isSubmitting = false,
}) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const router = useRouter();

    // フォーム値の変更ハンドラ
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // 入力タイプに応じた値の取得
        const newValue = type === 'checkbox' ? checked : value;

        // バリデーションエラーをクリア
        setErrors({
            ...errors,
            [name]: null,
        });

        // 値を更新
        setValues({
            ...values,
            [name]: newValue,
        });
    };

    // セレクトボックス変更ハンドラ
    const handleSelectChange = (name, value) => {
        setErrors({
            ...errors,
            [name]: null,
        });

        setValues({
            ...values,
            [name]: value,
        });
    };

    // バリデーション
    const validate = () => {
        const newErrors = {};

        fields.forEach((field) => {
            if (field.required && !values[field.name]) {
                newErrors[field.name] = `${field.label}は必須項目です`;
            }

            // カスタムバリデーション
            if (field.validate && values[field.name]) {
                const error = field.validate(values[field.name]);
                if (error) {
                    newErrors[field.name] = error;
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // フォーム送信
    const handleSubmit = async (e) => {
        e.preventDefault();

        // バリデーション
        if (!validate()) {
            return;
        }

        try {
            await onSubmit(values);
        } catch (error) {
            console.error('Form submission error:', error);

            // APIからのエラーメッセージがあれば表示
            if (error.errors) {
                setErrors(error.errors);
            }
        }
    };

    // キャンセルボタンのハンドラ
    const handleCancel = () => {
        if (cancelHref) {
            router.push(cancelHref);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
            </div>

            <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    {fields.map((field) => (
                        <div key={field.name} className={`${field.span || 'sm:col-span-3'}`}>
                            <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>

                            <div className="mt-1">
                                {field.type === 'text' && (
                                    <input
                                        type="text"
                                        name={field.name}
                                        id={field.name}
                                        value={values[field.name] || ''}
                                        onChange={handleChange}
                                        className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${errors[field.name] ? 'border-red-500' : ''
                                            }`}
                                        placeholder={field.placeholder}
                                        disabled={field.disabled || isSubmitting}
                                    />
                                )}

                                {field.type === 'textarea' && (
                                    <textarea
                                        name={field.name}
                                        id={field.name}
                                        value={values[field.name] || ''}
                                        onChange={handleChange}
                                        rows={field.rows || 3}
                                        className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${errors[field.name] ? 'border-red-500' : ''
                                            }`}
                                        placeholder={field.placeholder}
                                        disabled={field.disabled || isSubmitting}
                                    />
                                )}

                                {field.type === 'select' && (
                                    <select
                                        name={field.name}
                                        id={field.name}
                                        value={values[field.name] || ''}
                                        onChange={handleChange}
                                        className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${errors[field.name] ? 'border-red-500' : ''
                                            }`}
                                        disabled={field.disabled || isSubmitting}
                                    >
                                        <option value="">{field.placeholder || '選択してください'}</option>
                                        {field.options.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                {field.type === 'date' && (
                                    <input
                                        type="date"
                                        name={field.name}
                                        id={field.name}
                                        value={values[field.name] || ''}
                                        onChange={handleChange}
                                        className={`shadow-sm focus:ring-primary focus:border-primary block w-full sm:text-sm border-gray-300 rounded-md ${errors[field.name] ? 'border-red-500' : ''
                                            }`}
                                        disabled={field.disabled || isSubmitting}
                                    />
                                )}

                                {field.type === 'checkbox' && (
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            name={field.name}
                                            id={field.name}
                                            checked={!!values[field.name]}
                                            onChange={handleChange}
                                            className={`h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded ${errors[field.name] ? 'border-red-500' : ''
                                                }`}
                                            disabled={field.disabled || isSubmitting}
                                        />
                                        <label htmlFor={field.name} className="ml-2 block text-sm text-gray-900">
                                            {field.checkboxLabel || field.label}
                                        </label>
                                    </div>
                                )}

                                {errors[field.name] && (
                                    <p className="mt-1 text-sm text-red-500">{errors[field.name]}</p>
                                )}

                                {field.help && (
                                    <p className="mt-1 text-sm text-gray-500">{field.help}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 border-t border-gray-200 pt-5">
                    <div className="flex justify-end">
                        {cancelHref && (
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-3"
                                disabled={isSubmitting}
                            >
                                キャンセル
                            </button>
                        )}

                        <button
                            type="submit"
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-accent hover:bg-accent-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '処理中...' : submitButtonText}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}