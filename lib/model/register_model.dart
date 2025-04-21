class RegisterModel {
  int? code;
  bool? status;
  String? message;
  Data? data;

  RegisterModel({this.code, this.status, this.message, this.data});

  RegisterModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? new Data.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['code'] = code;
    data['status'] = status;
    data['message'] = message;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}

class Data {
  String? id;
  bool? isMpinSet;
  String? email;
  String? name;

  Data({this.id, this.isMpinSet, this.email, this.name});

  Data.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    isMpinSet = json['isMpinSet'];
    email = json['email'];
    name = json['name'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['id'] = id;
    data['isMpinSet'] = isMpinSet;
    data['email'] = email;
    data['name'] = name;
    return data;
  }
}
