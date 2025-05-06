// class CommonModel {
//   int? code;
//   bool? status;
//   String? message;

//   CommonModel({this.code, this.status, this.message});

//   CommonModel.fromJson(Map<String, dynamic> json) {
//     code = json['code'];
//     status = json['status'];
//     message = json['message'];
//   }

//   Map<String, dynamic> toJson() {
//     final Map<String, dynamic> data = <String, dynamic>{};
//     data['code'] = code;
//     data['status'] = status;
//     data['message'] = message;
//     return data;
//   }
// }

class CommonModel {
  int? code;
  bool? status;
  String? message;
  CData? data;

  CommonModel({this.code, this.status, this.message, this.data});

  CommonModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    data = json['data'] != null ? new CData.fromJson(json['data']) : null;
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    data['status'] = this.status;
    data['message'] = this.message;
    if (this.data != null) {
      data['data'] = this.data!.toJson();
    }
    return data;
  }
}

class CData {
  bool? class1;
  bool? section;
  bool? subject;
  bool? institutionRequired;
  bool? institution;
  String? role;

  CData(
      {this.class1,
      this.section,
      this.subject,
      this.institutionRequired,
      this.institution,
      this.role});

  CData.fromJson(Map<String, dynamic> json) {
    class1 = json['class'];
    section = json['section'];
    subject = json['subject'];
    institutionRequired = json['institutionRequired'];
    institution = json['institution'];
    role = json['role'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['class'] = this.class1;
    data['section'] = this.section;
    data['subject'] = this.subject;
    data['institutionRequired'] = this.institutionRequired;
    data['institution'] = this.institution;
    data['role'] = this.role;
    return data;
  }
}
