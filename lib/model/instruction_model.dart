class InstructionModel {
  int? code;
  bool? status;
  String? message;
  List<InstructionModelData>? data;

  InstructionModel({this.code, this.status, this.message, this.data});

  InstructionModel.fromJson(Map<String, dynamic> json) {
    code = json['code'];
    status = json['status'];
    message = json['message'];
    if (json['data'] != null) {
      data = <InstructionModelData>[];
      json['data'].forEach((v) {
        data!.add(new InstructionModelData.fromJson(v));
      });
    }
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['code'] = this.code;
    data['status'] = this.status;
    data['message'] = this.message;
    if (this.data != null) {
      data['data'] = this.data!.map((v) => v.toJson()).toList();
    }
    return data;
  }
}

class InstructionModelData {
  String? sId;
  String? type;
  String? description;
  String? instructionsName;

  InstructionModelData({this.sId, this.type, this.description, this.instructionsName});

  InstructionModelData.fromJson(Map<String, dynamic> json) {
    sId = json['_id'];
    type = json['type'];
    description = json['description'];
    instructionsName = json['InstructionsName'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = new Map<String, dynamic>();
    data['_id'] = this.sId;
    data['type'] = this.type;
    data['description'] = this.description;
    data['InstructionsName'] = this.instructionsName;
    return data;
  }
}
