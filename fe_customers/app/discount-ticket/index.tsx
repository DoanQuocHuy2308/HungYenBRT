import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, Modal, TextInput, 
  ActivityIndicator, Alert, Image 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useCustomerAuth } from '../../hooks/AuthProvider';
import { axiosClient, BASE_URL } from '../../api_client/axiosClient';

interface DiscountType {
  Id: number;
  Name: string;
  Description: string;
  DiscountPercentage: number;
  is_free: boolean;
  requires_document: boolean;
}

interface DiscountField {
  id: number;
  field_Name: string;
  field_Type: 'text' | 'image';
  is_Required: boolean;
}

export default function DiscountTicketScreen() {
  const insets = useSafeAreaInsets();
  const { userData } = useCustomerAuth();

  const [activeTab, setActiveTab] = useState<'register' | 'history'>('register');
  const [types, setTypes] = useState<DiscountType[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedType, setSelectedType] = useState<DiscountType | null>(null);
  const [fields, setFields] = useState<DiscountField[]>([]);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [loadingFields, setLoadingFields] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'register') {
        const res: any = await axiosClient.get('/discount-types');
        setTypes(res.data?.data || res.data || []);
      } else if (userData?.id) {
        const res: any = await axiosClient.get(`/discount-registrations/my-applications/${userData.id}`);
        setHistory(res.data?.data || res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectType = async (type: DiscountType) => {
    setSelectedType(type);
    setFields([]);
    setFormValues({});
    setLoadingFields(true);
    try {
      const res: any = await axiosClient.get(`/discount-fields/type/${type.Id}`);
      setFields(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không thể tải biểu mẫu cho loại ưu đãi này.');
      setSelectedType(null);
    } finally {
      setLoadingFields(false);
    }
  };

  const pickImage = async (fieldId: number) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFormValues(prev => ({
        ...prev,
        [fieldId]: result.assets[0]
      }));
    }
  };

  const handleSubmit = async () => {
    if (!selectedType || !userData?.id) return;

    // Validate required
    for (const field of fields) {
      if (field.is_Required && !formValues[field.id]) {
        Alert.alert('Thiếu thông tin', `Vui lòng cung cấp: ${field.field_Name}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('id_User', userData.id);
      formData.append('id_Discount_Type', String(selectedType.Id));

      fields.forEach(field => {
        const val = formValues[field.id];
        if (val) {
          if (field.field_Type === 'text') {
            formData.append(`text_field_${field.id}`, val);
          } else if (field.field_Type === 'image') {
            const uriParts = val.uri.split('.');
            const fileType = uriParts[uriParts.length - 1];
            formData.append(`file_field_${field.id}`, {
              uri: val.uri,
              name: `photo_${Date.now()}.${fileType}`,
              type: `image/${fileType}`,
            } as any);
          }
        }
      });

      const res: any = await axiosClient.post('/discount-registrations/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success || res.success) {
        Alert.alert('Thành công', 'Đã nộp hồ sơ. Vui lòng chờ quản trị viên xét duyệt.');
        setSelectedType(null);
        setActiveTab('history');
      } else {
        Alert.alert('Thất bại', 'Có lỗi xảy ra khi nộp hồ sơ.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Lỗi', 'Không thể gửi hồ sơ. Vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (s: string) => {
    if (s === 'approved') return 'text-emerald-600';
    if (s === 'rejected') return 'text-red-600';
    return 'text-amber-600';
  };
  const statusBg = (s: string) => {
    if (s === 'approved') return 'bg-emerald-50 border-emerald-200';
    if (s === 'rejected') return 'bg-red-50 border-red-200';
    return 'bg-amber-50 border-amber-200';
  };
  const statusText = (s: string) => {
    if (s === 'approved') return 'Đã Duyệt';
    if (s === 'rejected') return 'Từ Chối';
    return 'Chờ Duyệt';
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFBF7' }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 10, paddingBottom: 15, paddingHorizontal: 20, backgroundColor: '#5E3A21', flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20 }}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text style={{ flex: 1, textAlign: 'center', color: 'white', fontSize: 18, fontWeight: '800', marginRight: 40 }}>
          Hồ sơ Ưu đãi
        </Text>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', padding: 20, paddingBottom: 10 }}>
        <TouchableOpacity 
          onPress={() => setActiveTab('register')}
          style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: activeTab === 'register' ? '#7A5448' : 'transparent' }}
        >
          <Text style={{ fontSize: 15, fontWeight: activeTab === 'register' ? '800' : '600', color: activeTab === 'register' ? '#7A5448' : '#94a3b8' }}>Đăng ký ưu đãi</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveTab('history')}
          style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: activeTab === 'history' ? '#7A5448' : 'transparent' }}
        >
          <Text style={{ fontSize: 15, fontWeight: activeTab === 'history' ? '800' : '600', color: activeTab === 'history' ? '#7A5448' : '#94a3b8' }}>Lịch sử hồ sơ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator color="#7A5448" size="large" style={{ marginTop: 40 }} />
        ) : activeTab === 'register' ? (
          <>
            <View style={{ backgroundColor: '#Fef3c7', padding: 16, borderRadius: 16, marginBottom: 24, flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="information" size={24} color="#d97706" style={{ marginRight: 12 }} />
              <Text style={{ flex: 1, color: '#92400e', fontSize: 13, lineHeight: 20 }}>
                Bạn chỉ được đăng ký một loại ưu đãi trong cùng một thời điểm. Việc duyệt hồ sơ có thể mất từ 1-2 ngày làm việc.
              </Text>
            </View>

            <Text style={{ fontSize: 16, fontWeight: '800', color: '#1e293b', marginBottom: 16 }}>Đối tượng Miễn phí (100%)</Text>
            {types.filter(t => t.is_free).map(item => (
              <TouchableOpacity 
                key={item.Id} 
                onPress={() => handleSelectType(item)}
                style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', elevation: 1 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                  <MaterialCommunityIcons name="card-account-details-star-outline" size={24} color="#10b981" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 4 }}>{item.Name}</Text>
                  {item.Description ? <Text style={{ fontSize: 12, color: '#64748b' }}>{item.Description}</Text> : null}
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
              </TouchableOpacity>
            ))}

            <Text style={{ fontSize: 16, fontWeight: '800', color: '#1e293b', marginTop: 16, marginBottom: 16 }}>Đối tượng Trợ giá</Text>
            {types.filter(t => !t.is_free).map(item => (
              <TouchableOpacity 
                key={item.Id} 
                onPress={() => handleSelectType(item)}
                style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', elevation: 1 }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                  <MaterialCommunityIcons name="ticket-percent-outline" size={24} color="#3b82f6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#334155', marginBottom: 4 }}>{item.Name}</Text>
                  <Text style={{ fontSize: 13, color: '#3b82f6', fontWeight: '600' }}>Giảm {item.DiscountPercentage}%</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
              </TouchableOpacity>
            ))}
            <View style={{ height: 40 }} />
          </>
        ) : (
          /* History Tab */
          history.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <MaterialCommunityIcons name="file-document-outline" size={64} color="#cbd5e1" />
              <Text style={{ color: '#64748b', marginTop: 12 }}>Bạn chưa có hồ sơ đăng ký nào</Text>
            </View>
          ) : (
            history.map((reg, idx) => (
              <View key={idx} style={{ backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0', elevation: 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: '#1e293b' }}>{reg.discount_type?.Name}</Text>
                    <Text style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Ngày nộp: {new Date(reg.registration_Date).toLocaleDateString('vi-VN')}</Text>
                  </View>
                  <View style={{ borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, ...statusBg(reg.status) as any }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', ...statusColor(reg.status) as any }}>{statusText(reg.status)}</Text>
                  </View>
                </View>
                
                {reg.status === 'rejected' && reg.rejected_reason ? (
                  <View style={{ backgroundColor: '#fef2f2', padding: 10, borderRadius: 8, marginTop: 4 }}>
                    <Text style={{ color: '#b91c1c', fontSize: 12 }}>Lý do từ chối: {reg.rejected_reason}</Text>
                  </View>
                ) : null}

                {reg.status === 'approved' && reg.expiry_date ? (
                  <View style={{ backgroundColor: '#ecfdf5', padding: 10, borderRadius: 8, marginTop: 4 }}>
                    <Text style={{ color: '#047857', fontSize: 12 }}>Hạn sử dụng ưu đãi: {new Date(reg.expiry_date).toLocaleDateString('vi-VN')}</Text>
                  </View>
                ) : null}
              </View>
            ))
          )
        )}
      </ScrollView>

      {/* Form Modal */}
      <Modal visible={!!selectedType} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSelectedType(null)}>
        <View style={{ flex: 1, backgroundColor: '#FDFBF7' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderColor: '#e2e8f0', backgroundColor: 'white' }}>
            <View style={{ width: 32 }} />
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#1e293b' }}>Điền thông tin hồ sơ</Text>
            <TouchableOpacity onPress={() => setSelectedType(null)} style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', borderRadius: 16 }}>
              <MaterialCommunityIcons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 20 }} showsVerticalScrollIndicator={false}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#5E3A21', marginBottom: 8 }}>{selectedType?.Name}</Text>
            <Text style={{ fontSize: 13, color: '#64748b', marginBottom: 24 }}>Vui lòng cung cấp chính xác các giấy tờ dưới đây. Dữ liệu sai lệch sẽ bị từ chối.</Text>

            {loadingFields ? (
              <ActivityIndicator color="#7A5448" style={{ marginTop: 40 }} />
            ) : fields.length === 0 ? (
              <Text style={{ color: '#64748b', textAlign: 'center', marginTop: 20 }}>Loại ưu đãi này chưa yêu cầu thông tin gì thêm. Bạn có thể nộp ngay.</Text>
            ) : (
              fields.map(field => (
                <View key={field.id} style={{ marginBottom: 20 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8 }}>
                    {field.field_Name} {field.is_Required && <Text style={{ color: 'red' }}>*</Text>}
                  </Text>
                  
                  {field.field_Type === 'text' ? (
                    <TextInput
                      style={{ backgroundColor: 'white', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, padding: 12, fontSize: 15, color: '#0f172a' }}
                      placeholder="Nhập thông tin..."
                      value={formValues[field.id] || ''}
                      onChangeText={(t) => setFormValues(p => ({ ...p, [field.id]: t }))}
                    />
                  ) : (
                    <TouchableOpacity 
                      onPress={() => pickImage(field.id)}
                      style={{ 
                        height: 120, backgroundColor: 'white', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 12, 
                        borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                      }}
                    >
                      {formValues[field.id] ? (
                        <Image source={{ uri: formValues[field.id].uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                      ) : (
                        <>
                          <MaterialCommunityIcons name="camera-plus" size={32} color="#94a3b8" />
                          <Text style={{ color: '#64748b', marginTop: 8, fontSize: 13 }}>Nhấn để tải ảnh lên</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
            <View style={{ height: 40 }} />
          </ScrollView>

          <View style={{ padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#f1f5f9' }}>
            <TouchableOpacity 
              onPress={handleSubmit}
              disabled={submitting || loadingFields}
              style={{ backgroundColor: submitting ? '#5E3A21aa' : '#5E3A21', borderRadius: 16, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
            >
              {submitting && <ActivityIndicator color="white" style={{ marginRight: 10 }} size="small" />}
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '800' }}>Nộp hồ sơ duyệt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}
